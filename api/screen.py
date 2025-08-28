import json
import time
from http.server import BaseHTTPRequestHandler
import akshare as ak
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

class StockScreener:
    def __init__(self):
        self.stock_data = None
        self.cache_timestamp = 0
        self.cache_duration = 3600  # 1小时缓存
    
    def get_market_data(self):
        """获取市场数据，带缓存机制"""
        current_time = time.time()
        
        if self.stock_data is not None and (current_time - self.cache_timestamp) < self.cache_duration:
            return self.stock_data
        
        try:
            print("正在获取市场数据...")
            
            # 获取A股实时行情数据
            stock_data = ak.stock_zh_a_spot_em()
            
            # 数据清洗和预处理
            if stock_data is not None and not stock_data.empty:
                # 重命名列名为英文，便于处理
                stock_data.columns = [
                    'code', 'name', 'price', 'change_pct', 'change_amount',
                    'volume', 'turnover', 'amplitude', 'high', 'low', 'open',
                    'prev_close', 'volume_ratio', 'turnover_rate', 'pe_ratio',
                    'pb_ratio', 'total_value', 'circulation_value', 'speed_60',
                    'speed_5', 'speed_1', 'speed_today'
                ]
                
                # 数据类型转换
                numeric_columns = [
                    'price', 'change_pct', 'change_amount', 'volume', 'turnover',
                    'amplitude', 'high', 'low', 'open', 'prev_close', 'volume_ratio',
                    'turnover_rate', 'pe_ratio', 'pb_ratio', 'total_value', 'circulation_value'
                ]
                
                for col in numeric_columns:
                    if col in stock_data.columns:
                        stock_data[col] = pd.to_numeric(stock_data[col], errors='coerce')
                
                # 过滤掉无效数据
                stock_data = stock_data.dropna(subset=['price', 'volume'])
                stock_data = stock_data[stock_data['price'] > 0]
                stock_data = stock_data[stock_data['volume'] > 0]
                
                self.stock_data = stock_data
                self.cache_timestamp = current_time
                
                print(f"成功获取 {len(stock_data)} 只股票的市场数据")
                return stock_data
            else:
                raise Exception("获取到的数据为空")
                
        except Exception as e:
            print(f"获取市场数据失败: {str(e)}")
            # 返回空DataFrame，让各个策略处理
            return pd.DataFrame()
    
    def value_investing_strategy(self, limit=20):
        """价值投资策略：低PE、低PB、高股息率"""
        try:
            data = self.get_market_data()
            if data.empty:
                return []
            
            # 筛选条件
            filtered = data[
                (data['pe_ratio'] > 0) & (data['pe_ratio'] < 20) &  # PE < 20
                (data['pb_ratio'] > 0) & (data['pb_ratio'] < 3) &   # PB < 3
                (data['total_value'] > 10000000000)  # 市值 > 100亿
            ].copy()
            
            if filtered.empty:
                return []
            
            # 计算综合评分 (PE和PB越低越好)
            filtered['pe_score'] = 1 / filtered['pe_ratio']
            filtered['pb_score'] = 1 / filtered['pb_ratio']
            filtered['value_score'] = filtered['pe_score'] + filtered['pb_score']
            
            # 按评分排序
            result = filtered.nlargest(limit, 'value_score')
            
            return self._format_results(result, 'value_investing')
            
        except Exception as e:
            print(f"价值投资策略执行失败: {str(e)}")
            return []
    
    def growth_strategy(self, limit=20):
        """成长股策略：高增长、高ROE、合理估值"""
        try:
            data = self.get_market_data()
            if data.empty:
                return []
            
            # 筛选条件
            filtered = data[
                (data['change_pct'] > -10) & (data['change_pct'] < 50) &  # 涨跌幅合理
                (data['turnover_rate'] > 1) & (data['turnover_rate'] < 20) &  # 换手率适中
                (data['total_value'] > 5000000000)  # 市值 > 50亿
            ].copy()
            
            if filtered.empty:
                return []
            
            # 计算成长评分
            filtered['momentum_score'] = filtered['change_pct'] * 0.3
            filtered['liquidity_score'] = np.log(filtered['turnover']) * 0.2
            filtered['growth_score'] = filtered['momentum_score'] + filtered['liquidity_score']
            
            # 按评分排序
            result = filtered.nlargest(limit, 'growth_score')
            
            return self._format_results(result, 'growth')
            
        except Exception as e:
            print(f"成长股策略执行失败: {str(e)}")
            return []
    
    def momentum_strategy(self, limit=20):
        """动量策略：强势股、高成交量、技术突破"""
        try:
            data = self.get_market_data()
            if data.empty:
                return []
            
            # 筛选条件
            filtered = data[
                (data['change_pct'] > 2) &  # 今日涨幅 > 2%
                (data['volume_ratio'] > 1.5) &  # 量比 > 1.5
                (data['turnover_rate'] > 2) &  # 换手率 > 2%
                (data['price'] > data['prev_close'] * 1.02)  # 突破昨收盘价2%
            ].copy()
            
            if filtered.empty:
                return []
            
            # 计算动量评分
            filtered['price_momentum'] = filtered['change_pct'] * 0.4
            filtered['volume_momentum'] = filtered['volume_ratio'] * 0.3
            filtered['turnover_momentum'] = filtered['turnover_rate'] * 0.3
            filtered['momentum_score'] = (
                filtered['price_momentum'] + 
                filtered['volume_momentum'] + 
                filtered['turnover_momentum']
            )
            
            # 按评分排序
            result = filtered.nlargest(limit, 'momentum_score')
            
            return self._format_results(result, 'momentum')
            
        except Exception as e:
            print(f"动量策略执行失败: {str(e)}")
            return []
    
    def contrarian_strategy(self, limit=20):
        """逆向投资策略：超跌反弹、低位放量"""
        try:
            data = self.get_market_data()
            if data.empty:
                return []
            
            # 筛选条件
            filtered = data[
                (data['change_pct'] > -8) & (data['change_pct'] < -2) &  # 跌幅2-8%
                (data['volume_ratio'] > 1.2) &  # 量比 > 1.2
                (data['pe_ratio'] > 0) & (data['pe_ratio'] < 30) &  # PE合理
                (data['total_value'] > 3000000000)  # 市值 > 30亿
            ].copy()
            
            if filtered.empty:
                return []
            
            # 计算逆向投资评分 (跌幅越大、量比越高评分越高)
            filtered['decline_score'] = abs(filtered['change_pct']) * 0.4
            filtered['volume_score'] = filtered['volume_ratio'] * 0.3
            filtered['value_score'] = (1 / filtered['pe_ratio']) * 0.3
            filtered['contrarian_score'] = (
                filtered['decline_score'] + 
                filtered['volume_score'] + 
                filtered['value_score']
            )
            
            # 按评分排序
            result = filtered.nlargest(limit, 'contrarian_score')
            
            return self._format_results(result, 'contrarian')
            
        except Exception as e:
            print(f"逆向投资策略执行失败: {str(e)}")
            return []
    
    def _format_results(self, data, strategy_type):
        """格式化结果"""
        results = []
        
        for _, row in data.iterrows():
            result = {
                'symbol': str(row['code']),
                'name': str(row['name']),
                'price': float(row['price']),
                'change': float(row['change_amount']),
                'changePercent': float(row['change_pct']),
                'volume': int(row['volume']),
                'turnover': float(row['turnover']),
                'marketCap': float(row['total_value']) if pd.notna(row['total_value']) else 0,
                'pe': float(row['pe_ratio']) if pd.notna(row['pe_ratio']) else None,
                'pb': float(row['pb_ratio']) if pd.notna(row['pb_ratio']) else None,
                'turnoverRate': float(row['turnover_rate']) if pd.notna(row['turnover_rate']) else 0,
                'volumeRatio': float(row['volume_ratio']) if pd.notna(row['volume_ratio']) else 0,
                'strategy': strategy_type,
                'score': float(row.get(f'{strategy_type}_score', 0)),
                'lastUpdate': int(time.time() * 1000)
            }
            results.append(result)
        
        return results

# 全局筛选器实例
screener = StockScreener()

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # 读取请求体
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            strategy = request_data.get('strategy', 'value_investing')
            limit = min(int(request_data.get('limit', 20)), 50)  # 最多50只
            
            # 执行对应策略
            if strategy == 'value_investing':
                results = screener.value_investing_strategy(limit)
            elif strategy == 'growth':
                results = screener.growth_strategy(limit)
            elif strategy == 'momentum':
                results = screener.momentum_strategy(limit)
            elif strategy == 'contrarian':
                results = screener.contrarian_strategy(limit)
            else:
                raise ValueError(f"不支持的策略: {strategy}")
            
            # 返回结果
            response_data = {
                'success': True,
                'strategy': strategy,
                'count': len(results),
                'results': results,
                'timestamp': int(time.time() * 1000)
            }
            
            # 设置响应头
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            # 发送响应数据
            response_json = json.dumps(response_data, ensure_ascii=False)
            self.wfile.write(response_json.encode('utf-8'))
            
        except Exception as e:
            # 错误处理
            error_response = {
                'success': False,
                'error': str(e),
                'results': []
            }
            
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            error_json = json.dumps(error_response, ensure_ascii=False)
            self.wfile.write(error_json.encode('utf-8'))
    
    def do_OPTIONS(self):
        # 处理CORS预检请求
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
