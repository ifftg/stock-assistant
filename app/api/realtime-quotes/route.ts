import { NextRequest, NextResponse } from 'next/server'

// 模拟实时股票数据（实际应用中这会从真实的股票API获取）
const mockQuoteData: Record<string, any> = {
  '000001': { name: '平安银行', basePrice: 12.85, volatility: 0.02 },
  '000002': { name: '万科A', basePrice: 8.95, volatility: 0.03 },
  '600000': { name: '浦发银行', basePrice: 7.82, volatility: 0.02 },
  '600036': { name: '招商银行', basePrice: 35.68, volatility: 0.02 },
  '600519': { name: '贵州茅台', basePrice: 1685.50, volatility: 0.01 },
  '000858': { name: '五粮液', basePrice: 128.50, volatility: 0.02 },
  '002415': { name: '海康威视', basePrice: 32.45, volatility: 0.03 },
  '000725': { name: '京东方A', basePrice: 3.85, volatility: 0.04 },
  '600276': { name: '恒瑞医药', basePrice: 58.90, volatility: 0.02 },
  '300059': { name: '东方财富', basePrice: 15.68, volatility: 0.03 },
  '601318': { name: '中国平安', basePrice: 45.80, volatility: 0.02 },
  '300750': { name: '宁德时代', basePrice: 185.60, volatility: 0.03 },
  '601398': { name: '工商银行', basePrice: 4.85, volatility: 0.01 },
  '601939': { name: '建设银行', basePrice: 6.12, volatility: 0.01 },
  '601988': { name: '中国银行', basePrice: 3.45, volatility: 0.01 },
  '000568': { name: '泸州老窖', basePrice: 168.90, volatility: 0.02 },
  '002304': { name: '洋河股份', basePrice: 98.50, volatility: 0.02 },
  '600030': { name: '中信证券', basePrice: 18.75, volatility: 0.03 },
  '000166': { name: '申万宏源', basePrice: 4.25, volatility: 0.03 },
  '600887': { name: '伊利股份', basePrice: 28.90, volatility: 0.02 },
  '600028': { name: '中国石化', basePrice: 5.45, volatility: 0.02 },
  '601857': { name: '中国石油', basePrice: 6.78, volatility: 0.02 },
  '000063': { name: '中兴通讯', basePrice: 28.50, volatility: 0.03 },
  '002142': { name: '宁波银行', basePrice: 24.80, volatility: 0.02 },
  '002594': { name: '比亚迪', basePrice: 245.60, volatility: 0.04 },
  '000333': { name: '美的集团', basePrice: 52.30, volatility: 0.02 },
  '000651': { name: '格力电器', basePrice: 35.20, volatility: 0.02 }
}

function generateRealtimeQuote(symbol: string) {
  const baseData = mockQuoteData[symbol]
  
  if (!baseData) {
    return {
      symbol,
      name: `股票${symbol}`,
      price: 10.00,
      change: 0,
      changePercent: 0,
      volume: 1000000,
      turnover: 10000000,
      marketCap: 1000000000,
      high: 10.50,
      low: 9.50,
      open: 10.00,
      preClose: 10.00,
      lastUpdate: Date.now(),
      error: '数据不可用'
    }
  }
  
  // 生成模拟的实时价格变化
  const randomFactor = (Math.random() - 0.5) * 2 // -1 到 1
  const priceChange = baseData.basePrice * baseData.volatility * randomFactor
  const currentPrice = Number((baseData.basePrice + priceChange).toFixed(2))
  const change = Number(priceChange.toFixed(2))
  const changePercent = Number(((change / baseData.basePrice) * 100).toFixed(2))
  
  // 生成其他数据
  const volume = Math.floor(Math.random() * 50000000) + 1000000 // 100万到5000万
  const turnover = currentPrice * volume
  const marketCap = currentPrice * 1000000000 // 简化的市值计算
  
  const high = Number((currentPrice * (1 + Math.random() * 0.05)).toFixed(2))
  const low = Number((currentPrice * (1 - Math.random() * 0.05)).toFixed(2))
  const open = Number((currentPrice * (0.98 + Math.random() * 0.04)).toFixed(2))
  const preClose = Number((currentPrice - change).toFixed(2))
  
  return {
    symbol,
    name: baseData.name,
    price: currentPrice,
    change,
    changePercent,
    volume,
    turnover,
    marketCap,
    high,
    low,
    open,
    preClose,
    pe: Math.random() * 50 + 5, // 5-55之间的市盈率
    pb: Math.random() * 5 + 0.5, // 0.5-5.5之间的市净率
    high52w: high * (1.2 + Math.random() * 0.5), // 52周最高
    low52w: low * (0.7 - Math.random() * 0.2), // 52周最低
    lastUpdate: Date.now()
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tickersParam = searchParams.get('tickers') || ''
    
    if (!tickersParam) {
      return NextResponse.json({
        success: false,
        error: '请提供股票代码',
        quotes: []
      }, { status: 400 })
    }
    
    const tickers = tickersParam.split(',').map(t => t.trim()).filter(t => t)
    
    if (tickers.length === 0) {
      return NextResponse.json({
        success: false,
        error: '请提供有效的股票代码',
        quotes: []
      }, { status: 400 })
    }
    
    // 限制一次最多查询20只股票
    const limitedTickers = tickers.slice(0, 20)
    
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 生成实时行情数据
    const quotes = limitedTickers.map(ticker => generateRealtimeQuote(ticker))
    
    return NextResponse.json({
      success: true,
      count: quotes.length,
      tickers: limitedTickers,
      quotes,
      timestamp: Date.now()
    })
    
  } catch (error) {
    console.error('获取实时行情API错误:', error)
    return NextResponse.json({
      success: false,
      error: '获取行情失败',
      quotes: []
    }, { status: 500 })
  }
}
