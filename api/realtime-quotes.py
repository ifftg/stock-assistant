import json
import time
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import akshare as ak
import pandas as pd

def get_realtime_quotes(tickers):
    """获取实时股票行情"""
    if not tickers:
        return []
    
    results = []
    
    for ticker in tickers:
        try:
            # 获取实时行情数据
            stock_data = ak.stock_zh_a_spot_em()
            
            # 查找对应股票
            stock_info = stock_data[stock_data['代码'] == ticker]
            
            if not stock_info.empty:
                row = stock_info.iloc[0]
                
                # 解析数据
                current_price = float(row['最新价'])
                change = float(row['涨跌额'])
                change_percent = float(row['涨跌幅'])
                volume = int(row['成交量'])
                turnover = float(row['成交额'])
                
                # 计算市值（简化计算）
                market_cap = current_price * volume * 100 if volume > 0 else 0
                
                quote_data = {
                    'symbol': ticker,
                    'name': str(row['名称']),
                    'price': current_price,
                    'change': change,
                    'changePercent': change_percent,
                    'volume': volume,
                    'turnover': turnover,
                    'marketCap': market_cap,
                    'high': float(row['最高']),
                    'low': float(row['最低']),
                    'open': float(row['今开']),
                    'preClose': float(row['昨收']),
                    'lastUpdate': int(time.time() * 1000)  # 时间戳
                }
                
                results.append(quote_data)
            else:
                # 如果找不到数据，返回基础信息
                results.append({
                    'symbol': ticker,
                    'name': f'股票{ticker}',
                    'price': 0,
                    'change': 0,
                    'changePercent': 0,
                    'volume': 0,
                    'turnover': 0,
                    'marketCap': 0,
                    'high': 0,
                    'low': 0,
                    'open': 0,
                    'preClose': 0,
                    'lastUpdate': int(time.time() * 1000),
                    'error': '数据不可用'
                })
                
        except Exception as e:
            print(f"获取股票 {ticker} 数据失败: {str(e)}")
            # 返回错误信息
            results.append({
                'symbol': ticker,
                'name': f'股票{ticker}',
                'price': 0,
                'change': 0,
                'changePercent': 0,
                'volume': 0,
                'turnover': 0,
                'marketCap': 0,
                'high': 0,
                'low': 0,
                'open': 0,
                'preClose': 0,
                'lastUpdate': int(time.time() * 1000),
                'error': str(e)
            })
    
    return results

def get_fallback_quotes(tickers):
    """获取备用行情数据（当主要API失败时使用）"""
    fallback_data = {
        '000001': {'name': '平安银行', 'price': 12.85, 'change': -0.04, 'changePercent': -0.31},
        '000002': {'name': '万科A', 'price': 8.95, 'change': -0.12, 'changePercent': -1.32},
        '600000': {'name': '浦发银行', 'price': 7.82, 'change': 0.08, 'changePercent': 1.03},
        '600036': {'name': '招商银行', 'price': 35.68, 'change': 0.45, 'changePercent': 1.28},
        '600519': {'name': '贵州茅台', 'price': 1685.50, 'change': -15.20, 'changePercent': -0.89},
        '000858': {'name': '五粮液', 'price': 128.50, 'change': 2.30, 'changePercent': 1.82},
        '002415': {'name': '海康威视', 'price': 32.45, 'change': 0.85, 'changePercent': 2.69},
        '300750': {'name': '宁德时代', 'price': 185.60, 'change': -3.40, 'changePercent': -1.80}
    }
    
    results = []
    for ticker in tickers:
        if ticker in fallback_data:
            data = fallback_data[ticker]
            results.append({
                'symbol': ticker,
                'name': data['name'],
                'price': data['price'],
                'change': data['change'],
                'changePercent': data['changePercent'],
                'volume': 10000000,
                'turnover': data['price'] * 10000000,
                'marketCap': data['price'] * 1000000000,
                'high': data['price'] * 1.05,
                'low': data['price'] * 0.95,
                'open': data['price'] * 0.98,
                'preClose': data['price'] - data['change'],
                'lastUpdate': int(time.time() * 1000),
                'source': 'fallback'
            })
        else:
            results.append({
                'symbol': ticker,
                'name': f'股票{ticker}',
                'price': 10.00,
                'change': 0,
                'changePercent': 0,
                'volume': 1000000,
                'turnover': 10000000,
                'marketCap': 1000000000,
                'high': 10.50,
                'low': 9.50,
                'open': 10.00,
                'preClose': 10.00,
                'lastUpdate': int(time.time() * 1000),
                'source': 'fallback'
            })
    
    return results

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # 解析URL和查询参数
            parsed_url = urlparse(self.path)
            query_params = parse_qs(parsed_url.query)
            
            # 获取股票代码列表
            tickers_param = query_params.get('tickers', [''])[0]
            tickers = [t.strip() for t in tickers_param.split(',') if t.strip()]
            
            if not tickers:
                raise ValueError("请提供股票代码")
            
            # 限制一次最多查询20只股票
            if len(tickers) > 20:
                tickers = tickers[:20]
            
            try:
                # 尝试获取实时数据
                results = get_realtime_quotes(tickers)
            except Exception as e:
                print(f"实时数据获取失败，使用备用数据: {str(e)}")
                # 如果实时数据获取失败，使用备用数据
                results = get_fallback_quotes(tickers)
            
            # 返回结果
            response_data = {
                'success': True,
                'count': len(results),
                'tickers': tickers,
                'quotes': results,
                'timestamp': int(time.time() * 1000)
            }
            
            # 设置响应头
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
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
                'quotes': []
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
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
