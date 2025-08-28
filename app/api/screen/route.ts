import { NextRequest, NextResponse } from 'next/server'

// 模拟股票数据池
const mockStockPool = [
  // 银行股
  { code: '000001', name: '平安银行', price: 12.85, pe: 5.2, pb: 0.8, marketCap: 248500000000, volume: 45679000, turnover: 587234567, changePercent: -0.31, volumeRatio: 1.2, turnoverRate: 2.3 },
  { code: '600000', name: '浦发银行', price: 7.82, pe: 4.8, pb: 0.6, marketCap: 229800000000, volume: 28934500, turnover: 226234567, changePercent: 1.03, volumeRatio: 1.5, turnoverRate: 1.8 },
  { code: '600036', name: '招商银行', price: 35.68, pe: 6.2, pb: 1.1, marketCap: 918400000000, volume: 15678900, turnover: 559234567, changePercent: 1.28, volumeRatio: 0.9, turnoverRate: 1.2 },
  { code: '601398', name: '工商银行', price: 4.85, pe: 4.5, pb: 0.7, marketCap: 1720000000000, volume: 89765400, turnover: 435234567, changePercent: 0.62, volumeRatio: 1.1, turnoverRate: 0.8 },
  
  // 白酒股
  { code: '600519', name: '贵州茅台', price: 1685.50, pe: 28.5, pb: 8.2, marketCap: 2118000000000, volume: 1234567, turnover: 2081234567, changePercent: -0.89, volumeRatio: 0.8, turnoverRate: 0.3 },
  { code: '000858', name: '五粮液', price: 128.50, pe: 18.5, pb: 3.2, marketCap: 498200000000, volume: 8765400, turnover: 1126234567, changePercent: 1.82, volumeRatio: 1.3, turnoverRate: 1.5 },
  { code: '000568', name: '泸州老窖', price: 168.90, pe: 22.3, pb: 4.1, marketCap: 245600000000, volume: 5432100, turnover: 917234567, changePercent: 2.15, volumeRatio: 1.6, turnoverRate: 2.1 },
  
  // 科技股
  { code: '002415', name: '海康威视', price: 32.45, pe: 15.8, pb: 2.1, marketCap: 302400000000, volume: 23456700, turnover: 761234567, changePercent: 2.69, volumeRatio: 1.8, turnoverRate: 3.2 },
  { code: '300750', name: '宁德时代', price: 185.60, pe: 28.5, pb: 5.2, marketCap: 815400000000, volume: 15678900, turnover: 2910234567, changePercent: -1.80, volumeRatio: 1.4, turnoverRate: 2.8 },
  { code: '000725', name: '京东方A', price: 3.85, pe: 12.5, pb: 1.2, marketCap: 133800000000, volume: 89765400, turnover: 345234567, changePercent: -0.52, volumeRatio: 1.1, turnoverRate: 4.2 },
  
  // 医药股
  { code: '600276', name: '恒瑞医药', price: 58.90, pe: 22.5, pb: 4.8, marketCap: 378900000000, volume: 12345600, turnover: 727234567, changePercent: 2.08, volumeRatio: 1.2, turnoverRate: 1.9 },
  { code: '000661', name: '长春高新', price: 145.80, pe: 35.2, pb: 6.1, marketCap: 59200000000, volume: 2345670, turnover: 341234567, changePercent: 3.45, volumeRatio: 2.1, turnoverRate: 3.8 },
  
  // 新能源汽车
  { code: '002594', name: '比亚迪', price: 245.60, pe: 45.2, pb: 7.8, marketCap: 714500000000, volume: 18765400, turnover: 4608234567, changePercent: 4.25, volumeRatio: 2.3, turnoverRate: 4.1 },
  
  // 房地产
  { code: '000002', name: '万科A', price: 8.95, pe: 8.5, pb: 0.9, marketCap: 104500000000, volume: 32145600, turnover: 287234567, changePercent: -1.32, volumeRatio: 1.0, turnoverRate: 2.1 },
  
  // 保险
  { code: '601318', name: '中国平安', price: 45.80, pe: 8.9, pb: 1.3, marketCap: 836700000000, volume: 34567800, turnover: 1583234567, changePercent: 2.12, volumeRatio: 1.1, turnoverRate: 1.8 },
  
  // 食品饮料
  { code: '600887', name: '伊利股份', price: 28.90, pe: 16.8, pb: 2.9, marketCap: 188900000000, volume: 18765400, turnover: 542234567, changePercent: 1.05, volumeRatio: 1.0, turnoverRate: 2.2 },
  
  // 家电
  { code: '000333', name: '美的集团', price: 52.30, pe: 12.8, pb: 2.1, marketCap: 365400000000, volume: 14567800, turnover: 761234567, changePercent: 0.96, volumeRatio: 0.9, turnoverRate: 1.5 },
  { code: '000651', name: '格力电器', price: 35.20, pe: 11.5, pb: 1.8, marketCap: 211800000000, volume: 22345600, turnover: 786234567, changePercent: -0.85, volumeRatio: 1.2, turnoverRate: 2.8 },
  
  // 证券
  { code: '600030', name: '中信证券', price: 18.75, pe: 12.3, pb: 1.5, marketCap: 245600000000, volume: 45678900, turnover: 856234567, changePercent: 3.85, volumeRatio: 2.5, turnoverRate: 5.2 },
  
  // 石油化工
  { code: '600028', name: '中国石化', price: 5.45, pe: 8.2, pb: 0.8, marketCap: 659800000000, volume: 78965400, turnover: 430234567, changePercent: 1.12, volumeRatio: 1.1, turnoverRate: 1.8 }
]

function valueInvestingStrategy(limit: number) {
  // 价值投资：低PE、低PB、高市值
  const filtered = mockStockPool.filter(stock => 
    stock.pe > 0 && stock.pe < 20 &&
    stock.pb > 0 && stock.pb < 3 &&
    stock.marketCap > 10000000000
  )
  
  const scored = filtered.map(stock => ({
    ...stock,
    score: (1 / stock.pe) + (1 / stock.pb) + Math.log(stock.marketCap / 1000000000)
  }))
  
  return scored.sort((a, b) => b.score - a.score).slice(0, limit)
}

function growthStrategy(limit: number) {
  // 成长股：高增长、合理估值、活跃交易
  const filtered = mockStockPool.filter(stock => 
    stock.changePercent > -10 && stock.changePercent < 50 &&
    stock.turnoverRate > 1 && stock.turnoverRate < 20 &&
    stock.marketCap > 5000000000
  )
  
  const scored = filtered.map(stock => ({
    ...stock,
    score: stock.changePercent * 0.3 + Math.log(stock.turnover / 1000000) * 0.2 + stock.turnoverRate * 0.5
  }))
  
  return scored.sort((a, b) => b.score - a.score).slice(0, limit)
}

function momentumStrategy(limit: number) {
  // 动量策略：强势上涨、高成交量、技术突破
  const filtered = mockStockPool.filter(stock => 
    stock.changePercent > 2 &&
    stock.volumeRatio > 1.5 &&
    stock.turnoverRate > 2
  )
  
  const scored = filtered.map(stock => ({
    ...stock,
    score: stock.changePercent * 0.4 + stock.volumeRatio * 0.3 + stock.turnoverRate * 0.3
  }))
  
  return scored.sort((a, b) => b.score - a.score).slice(0, limit)
}

function contrarianStrategy(limit: number) {
  // 逆向投资：超跌反弹、低位放量
  const filtered = mockStockPool.filter(stock => 
    stock.changePercent > -8 && stock.changePercent < -2 &&
    stock.volumeRatio > 1.2 &&
    stock.pe > 0 && stock.pe < 30 &&
    stock.marketCap > 3000000000
  )
  
  const scored = filtered.map(stock => ({
    ...stock,
    score: Math.abs(stock.changePercent) * 0.4 + stock.volumeRatio * 0.3 + (1 / stock.pe) * 0.3
  }))
  
  return scored.sort((a, b) => b.score - a.score).slice(0, limit)
}

function formatResults(stocks: any[], strategy: string) {
  return stocks.map(stock => ({
    symbol: stock.code,
    name: stock.name,
    price: stock.price,
    change: stock.price * stock.changePercent / 100,
    changePercent: stock.changePercent,
    volume: stock.volume,
    turnover: stock.turnover,
    marketCap: stock.marketCap,
    pe: stock.pe,
    pb: stock.pb,
    turnoverRate: stock.turnoverRate,
    volumeRatio: stock.volumeRatio,
    strategy,
    score: stock.score,
    lastUpdate: Date.now()
  }))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { strategy, limit = 20 } = body
    
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    let results: any[] = []
    
    switch (strategy) {
      case 'value_investing':
        results = valueInvestingStrategy(Math.min(limit, 50))
        break
      case 'growth':
        results = growthStrategy(Math.min(limit, 50))
        break
      case 'momentum':
        results = momentumStrategy(Math.min(limit, 50))
        break
      case 'contrarian':
        results = contrarianStrategy(Math.min(limit, 50))
        break
      default:
        throw new Error(`不支持的策略: ${strategy}`)
    }
    
    const formattedResults = formatResults(results, strategy)
    
    return NextResponse.json({
      success: true,
      strategy,
      count: formattedResults.length,
      results: formattedResults,
      timestamp: Date.now()
    })
    
  } catch (error) {
    console.error('策略选股API错误:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '策略选股失败',
      results: []
    }, { status: 500 })
  }
}
