import { NextRequest, NextResponse } from 'next/server'

/**
 * 实时股票行情API路由
 * 调用Python Serverless Function获取真实股票数据
 */

// 标记为动态路由，避免静态生成问题
export const dynamic = 'force-dynamic'

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
    
    try {
      // 调用Python Serverless Function获取真实股票数据
      const pythonApiUrl = `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/api/realtime-quotes.py`
      
      const response = await fetch(pythonApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tickers: limitedTickers
        }),
        // 设置超时时间为30秒
        signal: AbortSignal.timeout(30000)
      })
      
      if (!response.ok) {
        throw new Error(`Python API 响应错误: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.quotes) {
        return NextResponse.json({
          success: true,
          count: data.quotes.length,
          tickers: limitedTickers,
          quotes: data.quotes,
          timestamp: Date.now()
        })
      } else {
        throw new Error(data.error || 'Python API 返回错误')
      }
      
    } catch (pythonApiError) {
      console.error('Python API 调用失败:', pythonApiError)
      
      // Python API失败时返回错误，不提供备用数据
      return NextResponse.json({
        success: false,
        error: 'Python API 暂时不可用，请稍后重试',
        quotes: [],
        details: pythonApiError instanceof Error ? pythonApiError.message : '未知错误'
      }, { status: 503 })
    }
    
  } catch (error) {
    console.error('获取实时行情API错误:', error)
    return NextResponse.json({
      success: false,
      error: '获取行情失败',
      quotes: []
    }, { status: 500 })
  }
}
