import { NextRequest, NextResponse } from 'next/server'

/**
 * 股票搜索API路由
 * 调用Python Serverless Function进行股票搜索
 */

// 标记为动态路由，避免静态生成问题
export const dynamic = 'force-dynamic'

// 备用搜索数据 - 仅在Python API不可用时使用
const fallbackStockList = [
  { symbol: '000001', name: '平安银行', market: '深交所', type: '银行' },
  { symbol: '600000', name: '浦发银行', market: '上交所', type: '银行' },
  { symbol: '600036', name: '招商银行', market: '上交所', type: '银行' },
  { symbol: '600519', name: '贵州茅台', market: '上交所', type: '白酒' },
  { symbol: '000858', name: '五粮液', market: '深交所', type: '白酒' },
  { symbol: '002415', name: '海康威视', market: '深交所', type: '安防' },
  { symbol: '300750', name: '宁德时代', market: '创业板', type: '电池' },
  { symbol: '601318', name: '中国平安', market: '上交所', type: '保险' },
  { symbol: '600276', name: '恒瑞医药', market: '上交所', type: '医药' },
  { symbol: '002594', name: '比亚迪', market: '深交所', type: '新能源汽车' }
]

function fallbackSearch(query: string, limit: number = 10) {
  if (!query || query.trim().length === 0) {
    return []
  }

  const searchTerm = query.trim().toUpperCase()
  const matches: Array<{score: number, stock: any}> = []

  for (const stock of fallbackStockList) {
    const symbol = stock.symbol.toUpperCase()
    const name = stock.name.toUpperCase()
    
    let score = 0
    
    if (symbol === searchTerm) {
      score = 100
    } else if (symbol.startsWith(searchTerm)) {
      score = 90
    } else if (symbol.includes(searchTerm)) {
      score = 80
    } else if (name === searchTerm) {
      score = 85
    } else if (name.startsWith(searchTerm)) {
      score = 75
    } else if (name.includes(searchTerm)) {
      score = 70
    }
    
    if (score > 0) {
      matches.push({ score, stock })
    }
  }
  
  matches.sort((a, b) => b.score - a.score)
  return matches.slice(0, limit).map(match => match.stock)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || ''
    const limit = parseInt(searchParams.get('limit') || '10')
    
    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        query,
        count: 0,
        results: []
      })
    }
    
    try {
      // 调用Python Serverless Function进行股票搜索
      const pythonApiUrl = `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/api/search-stocks.py`
      
      const response = await fetch(pythonApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          limit: Math.min(limit, 50) // 限制最多50个结果
        }),
        // 设置超时时间为30秒
        signal: AbortSignal.timeout(30000)
      })
      
      if (!response.ok) {
        throw new Error(`Python API 响应错误: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.results) {
        return NextResponse.json({
          success: true,
          query,
          count: data.results.length,
          results: data.results
        })
      } else {
        throw new Error(data.error || 'Python API 返回错误')
      }
      
    } catch (pythonApiError) {
      console.error('Python API 调用失败，使用备用搜索:', pythonApiError)
      
      // Python API失败时，使用备用搜索
      const results = fallbackSearch(query, limit)
      
      return NextResponse.json({
        success: true,
        query,
        count: results.length,
        results,
        fallback: true, // 标记为备用搜索结果
        note: 'Python API 暂时不可用，使用了备用搜索'
      })
    }
    
  } catch (error) {
    console.error('搜索股票API错误:', error)
    return NextResponse.json({
      success: false,
      error: '搜索失败',
      results: []
    }, { status: 500 })
  }
}
