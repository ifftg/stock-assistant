import json
import time
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import akshare as ak
import pandas as pd

# 全局缓存变量
_stock_cache = None
_cache_timestamp = 0
CACHE_DURATION = 24 * 60 * 60  # 24小时缓存

def get_all_stocks():
    """获取所有A股股票列表，带缓存机制"""
    global _stock_cache, _cache_timestamp
    
    current_time = time.time()
    
    # 检查缓存是否有效
    if _stock_cache is not None and (current_time - _cache_timestamp) < CACHE_DURATION:
        return _stock_cache
    
    try:
        print("正在获取A股股票列表...")
        
        # 获取沪深A股股票列表
        # 上交所股票
        sh_stocks = ak.stock_info_a_code_name()
        
        # 深交所股票  
        sz_stocks = ak.stock_info_sz_name_code()
        
        # 合并数据
        all_stocks = []
        
        # 处理上交所数据
        if sh_stocks is not None and not sh_stocks.empty:
            for _, row in sh_stocks.iterrows():
                stock_info = {
                    'symbol': str(row['code']),
                    'name': str(row['name']),
                    'market': '上交所' if str(row['code']).startswith('6') else '深交所',
                    'type': '股票'
                }
                all_stocks.append(stock_info)
        
        # 处理深交所数据
        if sz_stocks is not None and not sz_stocks.empty:
            for _, row in sz_stocks.iterrows():
                code = str(row['A股代码']) if 'A股代码' in row else str(row['code'])
                name = str(row['A股简称']) if 'A股简称' in row else str(row['name'])
                
                if code and name and code != 'nan' and name != 'nan':
                    market = '创业板' if code.startswith('3') else '深交所'
                    stock_info = {
                        'symbol': code,
                        'name': name,
                        'market': market,
                        'type': '股票'
                    }
                    all_stocks.append(stock_info)
        
        # 去重（基于股票代码）
        seen_codes = set()
        unique_stocks = []
        for stock in all_stocks:
            if stock['symbol'] not in seen_codes:
                seen_codes.add(stock['symbol'])
                unique_stocks.append(stock)
        
        # 更新缓存
        _stock_cache = unique_stocks
        _cache_timestamp = current_time
        
        print(f"成功获取 {len(unique_stocks)} 只股票")
        return unique_stocks
        
    except Exception as e:
        print(f"获取股票列表失败: {str(e)}")
        # 如果获取失败，返回一个基础的股票列表
        return [
            {'symbol': '000001', 'name': '平安银行', 'market': '深交所', 'type': '银行'},
            {'symbol': '000002', 'name': '万科A', 'market': '深交所', 'type': '房地产'},
            {'symbol': '600000', 'name': '浦发银行', 'market': '上交所', 'type': '银行'},
            {'symbol': '600036', 'name': '招商银行', 'market': '上交所', 'type': '银行'},
            {'symbol': '600519', 'name': '贵州茅台', 'market': '上交所', 'type': '白酒'},
            {'symbol': '000858', 'name': '五粮液', 'market': '深交所', 'type': '白酒'},
            {'symbol': '002415', 'name': '海康威视', 'market': '深交所', 'type': '安防'},
            {'symbol': '300750', 'name': '宁德时代', 'market': '创业板', 'type': '电池'}
        ]

def search_stocks(query, limit=10):
    """在股票列表中搜索"""
    if not query or len(query.strip()) == 0:
        return []
    
    query = query.strip().upper()
    all_stocks = get_all_stocks()
    
    # 搜索匹配
    matches = []
    
    for stock in all_stocks:
        symbol = stock['symbol'].upper()
        name = stock['name'].upper()
        
        # 计算匹配度
        score = 0
        
        # 精确匹配股票代码
        if symbol == query:
            score = 100
        # 股票代码开头匹配
        elif symbol.startswith(query):
            score = 90
        # 股票代码包含
        elif query in symbol:
            score = 80
        # 股票名称精确匹配
        elif name == query:
            score = 85
        # 股票名称开头匹配
        elif name.startswith(query):
            score = 75
        # 股票名称包含
        elif query in name:
            score = 70
        
        if score > 0:
            matches.append({
                'score': score,
                'stock': stock
            })
    
    # 按匹配度排序
    matches.sort(key=lambda x: x['score'], reverse=True)
    
    # 返回前N个结果
    return [match['stock'] for match in matches[:limit]]

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # 解析URL和查询参数
            parsed_url = urlparse(self.path)
            query_params = parse_qs(parsed_url.query)
            
            # 获取搜索查询
            query = query_params.get('query', [''])[0]
            limit = int(query_params.get('limit', ['10'])[0])
            
            # 执行搜索
            results = search_stocks(query, limit)
            
            # 返回结果
            response_data = {
                'success': True,
                'query': query,
                'count': len(results),
                'results': results
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
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
