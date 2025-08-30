// 股票数据API服务
export interface StockInfo {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap?: number
  pe?: number
  pb?: number
  high52w?: number
  low52w?: number
  lastUpdate: string
}

export interface StockSearchResult {
  symbol: string
  name: string
  market: string
  type: string
}

export interface HistoricalData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// 股票搜索数据 - 用于本地搜索备用

const searchableStocks: StockSearchResult[] = [
  { symbol: '000001', name: '平安银行', market: '深交所', type: '银行' },
  { symbol: '000002', name: '万科A', market: '深交所', type: '房地产' },
  { symbol: '600000', name: '浦发银行', market: '上交所', type: '银行' },
  { symbol: '600036', name: '招商银行', market: '上交所', type: '银行' },
  { symbol: '600519', name: '贵州茅台', market: '上交所', type: '白酒' },
  { symbol: '000858', name: '五粮液', market: '深交所', type: '白酒' },
  { symbol: '002415', name: '海康威视', market: '深交所', type: '安防' },
  { symbol: '000725', name: '京东方A', market: '深交所', type: '显示器' },
  { symbol: '600276', name: '恒瑞医药', market: '上交所', type: '医药' },
  { symbol: '300059', name: '东方财富', market: '创业板', type: '金融服务' },
  // 添加更多常见股票
  { symbol: '600887', name: '伊利股份', market: '上交所', type: '食品饮料' },
  { symbol: '000568', name: '泸州老窖', market: '深交所', type: '白酒' },
  { symbol: '002304', name: '洋河股份', market: '深交所', type: '白酒' },
  { symbol: '600030', name: '中信证券', market: '上交所', type: '证券' },
  { symbol: '000166', name: '申万宏源', market: '深交所', type: '证券' },
  { symbol: '601318', name: '中国平安', market: '上交所', type: '保险' },
  { symbol: '601398', name: '工商银行', market: '上交所', type: '银行' },
  { symbol: '601939', name: '建设银行', market: '上交所', type: '银行' },
  { symbol: '601988', name: '中国银行', market: '上交所', type: '银行' },
  { symbol: '600028', name: '中国石化', market: '上交所', type: '石油化工' },
  { symbol: '601857', name: '中国石油', market: '上交所', type: '石油化工' },
  { symbol: '000063', name: '中兴通讯', market: '深交所', type: '通信设备' },
  { symbol: '002142', name: '宁波银行', market: '深交所', type: '银行' },
  { symbol: '300750', name: '宁德时代', market: '创业板', type: '电池' }
]

// 获取热门股票（基于市值、成交量、涨跌幅等指标）
export async function getPopularStocks(): Promise<string[]> {
  // 热门股票筛选规则：
  // 1. 大盘蓝筹股（市值 > 1000亿）
  // 2. 活跃交易股（成交量大）
  // 3. 行业龙头股
  // 4. 近期表现活跃的股票

  const popularCriteria = [
    '600519', // 贵州茅台 - 白酒龙头，市值最大
    '000858', // 五粮液 - 白酒行业第二
    '601318', // 中国平安 - 保险龙头
    '600036', // 招商银行 - 银行业龙头
    '000001', // 平安银行 - 活跃银行股
    '600000', // 浦发银行 - 大型银行
    '002415', // 海康威视 - 安防龙头
    '600276', // 恒瑞医药 - 医药龙头
    '300750', // 宁德时代 - 新能源电池龙头
    '000002'  // 万科A - 房地产龙头
  ]

  return popularCriteria
}

// 搜索股票 - 连接真实API
export async function searchStocks(query: string): Promise<StockSearchResult[]> {
  if (!query.trim()) {
    return []
  }

  try {
    const response = await fetch(`/api/search-stocks?query=${encodeURIComponent(query)}&limit=10`)
    const data = await response.json()

    if (data.success && data.results) {
      return data.results.map((stock: any) => ({
        symbol: stock.symbol,
        name: stock.name,
        market: stock.market,
        type: stock.type
      }))
    } else {
      console.error('搜索API返回错误:', data.error)
      return []
    }
  } catch (error) {
    console.error('搜索股票失败:', error)
    // 如果API失败，返回备用搜索结果
    return searchableStocks.filter(stock =>
      stock.symbol.includes(query.toUpperCase()) ||
      stock.name.includes(query) ||
      stock.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10)
  }
}

// 获取股票详细信息 - 连接真实API
export async function getStockInfo(symbol: string): Promise<StockInfo | null> {
  try {
    const response = await fetch(`/api/realtime-quotes?tickers=${symbol}`)
    const data = await response.json()

    if (data.success && data.quotes && data.quotes.length > 0) {
      const quote = data.quotes[0]
      return {
        symbol: quote.symbol,
        name: quote.name,
        price: quote.price,
        change: quote.change,
        changePercent: quote.changePercent,
        volume: quote.volume,
        marketCap: quote.marketCap,
        pe: quote.pe || null,
        pb: quote.pb || null,
        high52w: quote.high52w || quote.high,
        low52w: quote.low52w || quote.low,
        lastUpdate: new Date(quote.lastUpdate).toISOString()
      }
    } else {
      console.error('获取股票信息API返回错误:', data.error)
      return null
    }
  } catch (error) {
    console.error('获取股票信息失败:', error)
    // API失败时返回null，不使用模拟数据
    return null
  }
}

// 获取多个股票信息 - 优化为批量请求
export async function getMultipleStockInfo(symbols: string[]): Promise<StockInfo[]> {
  if (symbols.length === 0) {
    return []
  }

  try {
    // 批量请求所有股票数据
    const tickersParam = symbols.join(',')
    const response = await fetch(`/api/realtime-quotes?tickers=${tickersParam}`)
    const data = await response.json()

    if (data.success && data.quotes) {
      return data.quotes.map((quote: any) => ({
        symbol: quote.symbol,
        name: quote.name,
        price: quote.price,
        change: quote.change,
        changePercent: quote.changePercent,
        volume: quote.volume,
        marketCap: quote.marketCap,
        pe: quote.pe || null,
        pb: quote.pb || null,
        high52w: quote.high52w || quote.high,
        low52w: quote.low52w || quote.low,
        lastUpdate: new Date(quote.lastUpdate).toISOString()
      }))
    } else {
      console.error('批量获取股票信息API返回错误:', data.error)
      // 如果批量API失败，回退到单个请求
      const promises = symbols.map(symbol => getStockInfo(symbol))
      const results = await Promise.all(promises)
      return results.filter(stock => stock !== null) as StockInfo[]
    }
  } catch (error) {
    console.error('批量获取股票信息失败:', error)
    // 如果批量API失败，回退到单个请求
    const promises = symbols.map(symbol => getStockInfo(symbol))
    const results = await Promise.all(promises)
    return results.filter(stock => stock !== null) as StockInfo[]
  }
}

// 获取历史数据
export async function getHistoricalData(symbol: string, days: number = 30): Promise<HistoricalData[]> {
  try {
    // TODO: 实现真实的历史数据API调用
    // const response = await fetch(`/api/historical-data?symbol=${symbol}&days=${days}`)
    // const data = await response.json()
    // if (data.success) {
    //   return data.historicalData
    // }
    
    // 暂时返回空数组，等待真实API实现
    console.warn(`历史数据API尚未实现，股票代码: ${symbol}`)
    return []
  } catch (error) {
    console.error('获取历史数据失败:', error)
    return []
  }
}

// 格式化价格
export function formatPrice(price: number): string {
  return price.toFixed(2)
}

// 格式化变化
export function formatChange(change: number, changePercent: number): string {
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`
}

// 格式化成交量
export function formatVolume(volume: number): string {
  if (volume >= 100000000) {
    return `${(volume / 100000000).toFixed(1)}亿`
  } else if (volume >= 10000) {
    return `${(volume / 10000).toFixed(1)}万`
  }
  return volume.toString()
}

// 格式化市值
export function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1000000000000) {
    return `${(marketCap / 1000000000000).toFixed(2)}万亿`
  } else if (marketCap >= 100000000) {
    return `${(marketCap / 100000000).toFixed(0)}亿`
  }
  return marketCap.toString()
}
