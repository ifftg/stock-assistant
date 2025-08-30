import { NextRequest, NextResponse } from 'next/server'

/**
 * 股票策略选股API路由
 * 调用Python Serverless Function进行策略筛选
 */

// 标记为动态路由，避免静态生成问题
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { strategy, limit = 20 } = body
    
    if (!strategy) {
      return NextResponse.json({
        success: false,
        error: '请提供策略名称',
        results: []
      }, { status: 400 })
    }
    
    // 验证策略类型
    const validStrategies = ['value_investing', 'growth', 'momentum', 'contrarian']
    if (!validStrategies.includes(strategy)) {
      return NextResponse.json({
        success: false,
        error: `不支持的策略: ${strategy}`,
        results: []
      }, { status: 400 })
    }
    
    try {
      // 调用Python Serverless Function进行策略筛选
      const pythonApiUrl = `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/api/screen.py`
      
      const response = await fetch(pythonApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          strategy,
          limit: Math.min(limit, 50) // 限制最多50个结果
        }),
        // 设置超时时间为60秒（策略筛选可能需要更长时间）
        signal: AbortSignal.timeout(60000)
      })
      
      if (!response.ok) {
        throw new Error(`Python API 响应错误: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.results) {
        return NextResponse.json({
          success: true,
          strategy,
          count: data.results.length,
          results: data.results,
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
        results: [],
        details: pythonApiError instanceof Error ? pythonApiError.message : '未知错误'
      }, { status: 503 })
    }
    
  } catch (error) {
    console.error('策略选股API错误:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '策略选股失败',
      results: []
    }, { status: 500 })
  }
}
