// 东方财富API研究和测试文件
// 用于研究东方财富API接口，测试数据获取

/**
 * 东方财富API接口研究
 * 
 * 主要接口：
 * 1. 股票列表：获取所有A股列表
 * 2. 实时行情：获取股票实时价格
 * 3. 历史数据：获取K线数据
 * 4. 财务指标：获取PE、PB等指标
 */

// 东方财富API基础配置
const EASTMONEY_CONFIG = {
  // 基础URL
  BASE_URL: 'https://push2.eastmoney.com/api/qt',
  
  // 股票列表接口
  STOCK_LIST: '/clist/get',
  
  // 实时行情接口  
  REALTIME: '/stock/get',
  
  // K线数据接口
  KLINE: '/stock/kline/get',
  
  // 通用参数
  COMMON_PARAMS: {
    cb: 'jQuery', // 回调函数名
    pn: 1,        // 页码
    pz: 50,       // 每页数量
    po: 1,        // 排序
    np: 1,        // 不分页
    ut: 'bd1d9ddb04089700cf9c27f6f7426281', // 用户token
    fltt: 2,      // 过滤条件
    invt: 2,      // 投资类型
    fid: 'f3',    // 排序字段
    fs: 'm:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23', // 市场筛选：A股
    fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152'
  }
}

/**
 * 字段映射说明
 * f1: 最新价
 * f2: 涨跌幅
 * f3: 涨跌额  
 * f4: 成交量
 * f5: 成交额
 * f6: 振幅
 * f7: 换手率
 * f8: 市盈率动态
 * f9: 市净率
 * f10: 量比
 * f11: 总市值
 * f12: 代码
 * f13: 市场
 * f14: 名称
 * f15: 最高
 * f16: 最低
 * f17: 今开
 * f18: 昨收
 * f20: 总股本
 * f21: 流通股本
 * f22: 速度
 * f23: 市盈率TTM
 * f24: 市销率
 * f25: 市现率
 */

// 构建请求URL的工具函数
function buildEastmoneyUrl(endpoint: string, params: Record<string, any> = {}): string {
  const baseParams = { ...EASTMONEY_CONFIG.COMMON_PARAMS, ...params }
  const queryString = Object.entries(baseParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&')
  
  return `${EASTMONEY_CONFIG.BASE_URL}${endpoint}?${queryString}`
}

// 解析东方财富返回的JSONP数据
function parseEastmoneyResponse(response: string): any {
  try {
    // 移除JSONP包装
    const jsonStr = response.replace(/^jQuery\d+_\d+\(/, '').replace(/\);?$/, '')
    return JSON.parse(jsonStr)
  } catch (error) {
    console.error('解析东方财富响应失败:', error)
    return null
  }
}

// 获取A股股票列表
export async function getStockList(pageSize: number = 100): Promise<any[]> {
  try {
    const url = buildEastmoneyUrl(EASTMONEY_CONFIG.STOCK_LIST, {
      pz: pageSize,
      fid: 'f3', // 按涨跌幅排序
    })
    
    console.log('请求URL:', url)
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://quote.eastmoney.com/',
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const text = await response.text()
    const data = parseEastmoneyResponse(text)
    
    if (!data || !data.data || !data.data.diff) {
      throw new Error('返回数据格式错误')
    }
    
    // 处理股票数据
    const stocks = data.data.diff.map((item: any) => ({
      ticker: item.f12,           // 股票代码
      name: item.f14,             // 股票名称
      market: getMarketName(item.f13), // 市场
      price: item.f2 / 100,       // 最新价（分转元）
      change: item.f3 / 100,      // 涨跌额
      changePercent: item.f3,     // 涨跌幅
      volume: item.f5,            // 成交量
      turnover: item.f6,          // 成交额
      peRatio: item.f9,           // 市盈率动态
      pbRatio: item.f23,          // 市净率
      marketCap: item.f20,        // 总市值
      high: item.f15 / 100,       // 最高价
      low: item.f16 / 100,        // 最低价
      open: item.f17 / 100,       // 开盘价
      close: item.f18 / 100,      // 昨收价
    }))
    
    return stocks
    
  } catch (error) {
    console.error('获取股票列表失败:', error)
    throw error
  }
}

// 获取单只股票详细信息
export async function getStockDetail(ticker: string): Promise<any> {
  try {
    // 确定市场代码
    const marketCode = ticker.startsWith('6') ? '1' : '0' // 6开头是上海，其他是深圳
    const stockCode = `${marketCode}.${ticker}`
    
    const url = buildEastmoneyUrl(EASTMONEY_CONFIG.REALTIME, {
      secid: stockCode,
      fields: 'f43,f57,f58,f169,f170,f46,f44,f51,f168,f47,f164,f163,f116,f60,f45,f52,f50,f48,f167,f117,f71,f161,f49,f530,f135,f136,f137,f138,f139,f141,f142,f144,f145,f147,f148,f140,f143,f146,f149,f55,f62,f162,f92,f173,f104,f105,f84,f85,f183,f184,f185,f186,f187,f188,f189,f190,f191,f192,f107,f111,f86,f177,f78,f110,f262,f263,f264,f267,f268,f250,f251,f252,f253,f254,f255,f256,f257,f258,f266,f269,f270,f271,f273,f274,f275,f127,f199,f128,f198,f259,f260,f261,f171,f277,f278,f279,f288,f152,f250,f251,f252,f253,f254,f255,f256,f257,f258'
    })
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://quote.eastmoney.com/',
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const text = await response.text()
    const data = parseEastmoneyResponse(text)
    
    if (!data || !data.data) {
      throw new Error('返回数据格式错误')
    }
    
    return data.data
    
  } catch (error) {
    console.error('获取股票详情失败:', error)
    throw error
  }
}

// 获取K线历史数据
export async function getStockKline(ticker: string, period: string = '101', count: number = 30): Promise<any[]> {
  try {
    const marketCode = ticker.startsWith('6') ? '1' : '0'
    const stockCode = `${marketCode}.${ticker}`
    
    const url = buildEastmoneyUrl(EASTMONEY_CONFIG.KLINE, {
      secid: stockCode,
      klt: period, // 101=日K, 102=周K, 103=月K
      fqt: 1,      // 复权类型：0不复权，1前复权，2后复权
      lmt: count,  // 数据条数
      end: '20500101', // 结束日期
      iscca: 1,    // 是否包含创业板
      fields1: 'f1,f2,f3,f4,f5,f6',
      fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
      ut: 'fa5fd1943c7b386f172d6893dbfba10b'
    })
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://quote.eastmoney.com/',
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const text = await response.text()
    const data = parseEastmoneyResponse(text)
    
    if (!data || !data.data || !data.data.klines) {
      throw new Error('返回数据格式错误')
    }
    
    // 解析K线数据
    const klines = data.data.klines.map((kline: string) => {
      const [date, open, close, high, low, volume, turnover, amplitude, changePercent, change, turnoverRate] = kline.split(',')
      
      return {
        date,
        open: parseFloat(open),
        close: parseFloat(close),
        high: parseFloat(high),
        low: parseFloat(low),
        volume: parseInt(volume),
        turnover: parseFloat(turnover),
        amplitude: parseFloat(amplitude),
        changePercent: parseFloat(changePercent),
        change: parseFloat(change),
        turnoverRate: parseFloat(turnoverRate)
      }
    })
    
    return klines
    
  } catch (error) {
    console.error('获取K线数据失败:', error)
    throw error
  }
}

// 市场代码转换
function getMarketName(marketCode: string): string {
  const marketMap: Record<string, string> = {
    '0': '深圳',
    '1': '上海',
    '116': '美股',
    '117': '港股'
  }
  return marketMap[marketCode] || '未知'
}

// 测试函数
export async function testEastmoneyAPI() {
  console.log('开始测试东方财富API...')
  
  try {
    // 测试1：获取股票列表
    console.log('\n=== 测试1：获取股票列表 ===')
    const stocks = await getStockList(10)
    console.log(`获取到 ${stocks.length} 只股票`)
    console.log('前3只股票:', stocks.slice(0, 3))
    
    if (stocks.length > 0) {
      const testTicker = stocks[0].ticker
      
      // 测试2：获取股票详情
      console.log(`\n=== 测试2：获取股票详情 (${testTicker}) ===`)
      const detail = await getStockDetail(testTicker)
      console.log('股票详情:', detail)
      
      // 测试3：获取K线数据
      console.log(`\n=== 测试3：获取K线数据 (${testTicker}) ===`)
      const klines = await getStockKline(testTicker, '101', 5)
      console.log(`获取到 ${klines.length} 条K线数据`)
      console.log('最近5天数据:', klines)
    }
    
    console.log('\n✅ 东方财富API测试完成')
    
  } catch (error) {
    console.error('❌ 东方财富API测试失败:', error)
  }
}

// 如果直接运行此文件，执行测试
if (import.meta.main) {
  testEastmoneyAPI()
}
