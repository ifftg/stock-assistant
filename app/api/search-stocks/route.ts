import { NextRequest, NextResponse } from 'next/server'

// 模拟完整的A股股票列表（实际应用中这会从数据库或外部API获取）
const mockStockList = [
  // 银行股
  { symbol: '000001', name: '平安银行', market: '深交所', type: '银行' },
  { symbol: '600000', name: '浦发银行', market: '上交所', type: '银行' },
  { symbol: '600036', name: '招商银行', market: '上交所', type: '银行' },
  { symbol: '601398', name: '工商银行', market: '上交所', type: '银行' },
  { symbol: '601939', name: '建设银行', market: '上交所', type: '银行' },
  { symbol: '601988', name: '中国银行', market: '上交所', type: '银行' },
  { symbol: '002142', name: '宁波银行', market: '深交所', type: '银行' },
  
  // 白酒股
  { symbol: '600519', name: '贵州茅台', market: '上交所', type: '白酒' },
  { symbol: '000858', name: '五粮液', market: '深交所', type: '白酒' },
  { symbol: '000568', name: '泸州老窖', market: '深交所', type: '白酒' },
  { symbol: '002304', name: '洋河股份', market: '深交所', type: '白酒' },
  { symbol: '000596', name: '古井贡酒', market: '深交所', type: '白酒' },
  
  // 科技股
  { symbol: '002415', name: '海康威视', market: '深交所', type: '安防' },
  { symbol: '000725', name: '京东方A', market: '深交所', type: '显示器' },
  { symbol: '000063', name: '中兴通讯', market: '深交所', type: '通信设备' },
  { symbol: '002230', name: '科大讯飞', market: '深交所', type: 'AI' },
  { symbol: '300059', name: '东方财富', market: '创业板', type: '金融服务' },
  { symbol: '300750', name: '宁德时代', market: '创业板', type: '电池' },
  
  // 房地产
  { symbol: '000002', name: '万科A', market: '深交所', type: '房地产' },
  { symbol: '000001', name: '平安银行', market: '深交所', type: '银行' },
  
  // 保险
  { symbol: '601318', name: '中国平安', market: '上交所', type: '保险' },
  { symbol: '601601', name: '中国太保', market: '上交所', type: '保险' },
  
  // 证券
  { symbol: '600030', name: '中信证券', market: '上交所', type: '证券' },
  { symbol: '000166', name: '申万宏源', market: '深交所', type: '证券' },
  
  // 医药
  { symbol: '600276', name: '恒瑞医药', market: '上交所', type: '医药' },
  { symbol: '000661', name: '长春高新', market: '深交所', type: '医药' },
  
  // 食品饮料
  { symbol: '600887', name: '伊利股份', market: '上交所', type: '食品饮料' },
  { symbol: '000895', name: '双汇发展', market: '深交所', type: '食品饮料' },
  
  // 石油化工
  { symbol: '600028', name: '中国石化', market: '上交所', type: '石油化工' },
  { symbol: '601857', name: '中国石油', market: '上交所', type: '石油化工' },
  
  // 汽车
  { symbol: '002594', name: '比亚迪', market: '深交所', type: '新能源汽车' },
  { symbol: '600104', name: '上汽集团', market: '上交所', type: '汽车' },
  
  // 家电
  { symbol: '000333', name: '美的集团', market: '深交所', type: '家电' },
  { symbol: '000651', name: '格力电器', market: '深交所', type: '家电' },
  
  // 更多股票...
  { symbol: '600519', name: '贵州茅台', market: '上交所', type: '白酒' },
  { symbol: '000858', name: '五粮液', market: '深交所', type: '白酒' }
]

function searchStocks(query: string, limit: number = 10) {
  if (!query || query.trim().length === 0) {
    return []
  }

  const searchTerm = query.trim().toUpperCase()
  const matches: Array<{score: number, stock: any}> = []

  for (const stock of mockStockList) {
    const symbol = stock.symbol.toUpperCase()
    const name = stock.name.toUpperCase()
    
    let score = 0
    
    // 精确匹配股票代码
    if (symbol === searchTerm) {
      score = 100
    }
    // 股票代码开头匹配
    else if (symbol.startsWith(searchTerm)) {
      score = 90
    }
    // 股票代码包含
    else if (symbol.includes(searchTerm)) {
      score = 80
    }
    // 股票名称精确匹配
    else if (name === searchTerm) {
      score = 85
    }
    // 股票名称开头匹配
    else if (name.startsWith(searchTerm)) {
      score = 75
    }
    // 股票名称包含
    else if (name.includes(searchTerm)) {
      score = 70
    }
    
    if (score > 0) {
      matches.push({ score, stock })
    }
  }
  
  // 按匹配度排序并返回前N个结果
  matches.sort((a, b) => b.score - a.score)
  return matches.slice(0, limit).map(match => match.stock)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || ''
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const results = searchStocks(query, limit)
    
    return NextResponse.json({
      success: true,
      query,
      count: results.length,
      results
    })
    
  } catch (error) {
    console.error('搜索股票API错误:', error)
    return NextResponse.json({
      success: false,
      error: '搜索失败',
      results: []
    }, { status: 500 })
  }
}
