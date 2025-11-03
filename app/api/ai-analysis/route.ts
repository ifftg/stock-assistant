// AI股票分析API
// 直接在Next.js中实现AI分析功能

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

interface StockData {
  ticker: string
  name: string
  industry: string
  market: string
  currentPrice: number
  changePercent: number
  peRatio?: number
  pbRatio?: number
  marketCap?: number
  volume?: number
  turnover?: number
}

interface HistoricalData {
  trade_date: string
  open_price: number
  high_price: number
  low_price: number
  close_price: number
  volume: number
}

export async function POST(req: NextRequest) {
  try {
    const { ticker } = await req.json()

    if (!ticker) {
      return NextResponse.json(
        { error: '缺少股票代码参数' },
        { status: 400 }
      )
    }

    // 初始化Supabase客户端
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 获取股票基本信息
    const { data: stockInfo, error: stockError } = await supabase
      .from('stocks_info')
      .select('*')
      .eq('ticker', ticker)
      .single()

    if (stockError || !stockInfo) {
      return NextResponse.json(
        { error: '未找到股票信息' },
        { status: 404 }
      )
    }

    // 获取最近30天的历史数据
    const { data: historicalData, error: histError } = await supabase
      .from('stocks_daily')
      .select('trade_date,open_price,high_price,low_price,close_price,volume,turnover,pe_ratio,pb_ratio,market_cap')
      .eq('ticker', ticker)
      .order('trade_date', { ascending: false })
      .limit(30)

    if (histError) {
      return NextResponse.json(
        { error: '获取历史数据失败' },
        { status: 500 }
      )
    }

    const latestData = historicalData?.[0]
    const prevData = historicalData?.[1]

    if (!latestData) {
      return NextResponse.json(
        { error: '缺少最新交易数据' },
        { status: 404 }
      )
    }

    // 计算技术指标
    const changePercent = prevData ?
      ((latestData.close_price - prevData.close_price) / prevData.close_price * 100) : 0

    // 构建股票数据对象
    const stockData: StockData = {
      ticker: stockInfo.ticker,
      name: stockInfo.name,
      industry: stockInfo.industry,
      market: stockInfo.market,
      currentPrice: latestData.close_price,
      changePercent: Number(changePercent.toFixed(2)),
      peRatio: latestData.pe_ratio,
      pbRatio: latestData.pb_ratio,
      marketCap: latestData.market_cap,
      volume: latestData.volume,
      turnover: latestData.turnover
    }

    // 准备AI分析的提示词
    const prompt = generateAnalysisPrompt(stockData, historicalData)

    // 调用Gemini API进行分析
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'AI分析服务未配置' },
        { status: 500 }
      )
    }

    const aiAnalysis = await callGeminiAPI(prompt, geminiApiKey)

    return NextResponse.json({
      success: true,
      data: {
        stockData,
        analysis: aiAnalysis,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('AI分析错误:', error)
    return NextResponse.json(
      {
        error: '分析过程中发生错误',
        details: error.message
      },
      { status: 500 }
    )
  }
}

function generateAnalysisPrompt(stockData: StockData, historicalData: HistoricalData[]): string {
  const recentPrices = historicalData.slice(0, 5).map(d => d.close_price)
  const avgVolume = historicalData.reduce((sum, d) => sum + d.volume, 0) / historicalData.length

  return `请对以下股票进行专业分析：

股票信息：
- 名称：${stockData.name} (${stockData.ticker})
- 行业：${stockData.industry}
- 市场：${stockData.market}
- 当前价格：${stockData.currentPrice}元
- 涨跌幅：${stockData.changePercent}%
- PE比率：${stockData.peRatio || '未知'}
- PB比率：${stockData.pbRatio || '未知'}
- 市值：${stockData.marketCap ? (stockData.marketCap / 100000000).toFixed(0) + '亿元' : '未知'}
- 成交量：${stockData.volume || '未知'}
- 成交额：${stockData.turnover ? (stockData.turnover / 100000000).toFixed(2) + '亿元' : '未知'}

最近5日收盘价：${recentPrices.join(', ')}元
平均成交量：${avgVolume.toFixed(0)}

请从以下几个维度进行分析：
1. 技术面分析：价格趋势、成交量分析、支撑阻力位
2. 基本面分析：估值水平、行业地位、财务指标
3. 风险评估：投资风险等级、注意事项
4. 投资建议：买入/持有/卖出建议及理由

请用中文回答，保持专业性和客观性，分析应该简洁明了，每个维度控制在100字以内。`
}

async function callGeminiAPI(prompt: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API错误: ${response.status}`)
    }

    const data = await response.json()

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text
    } else {
      throw new Error('Gemini API返回格式异常')
    }
  } catch (error: any) {
    console.error('调用Gemini API失败:', error)
    return `AI分析暂时不可用，请稍后重试。错误信息：${error?.message || String(error)}`
  }
}
