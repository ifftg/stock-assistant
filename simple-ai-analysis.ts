// 简化版：只用边缘函数调用Gemini进行股票分析
// 股票数据由前端传入，不需要边缘函数获取

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 处理CORS预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 获取Gemini API密钥
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')!
    
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'Gemini API密钥未配置' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 获取前端传来的股票数据
    const { 
      ticker, 
      stockName, 
      currentPrice, 
      priceHistory, // 前端传入的价格历史数据
      volume,
      marketCap,
      peRatio,
      analysisType = 'comprehensive' 
    } = await req.json()

    if (!ticker || !currentPrice) {
      return new Response(
        JSON.stringify({ error: '股票代码和当前价格不能为空' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 构建专业的股票分析提示词
    const prompt = `
你是一位专业的股票分析师，请对以下股票进行全面分析：

## 股票基本信息
- 股票代码：${ticker}
- 股票名称：${stockName || ticker}
- 当前价格：${currentPrice}
- 成交量：${volume || '未提供'}
- 市值：${marketCap || '未提供'}
- 市盈率：${peRatio || '未提供'}

## 价格历史数据
${priceHistory ? priceHistory.map((item: any, index: number) => 
  `第${index + 1}天：价格 ${item.price}，涨跌幅 ${item.change || 'N/A'}%`
).join('\n') : '暂无历史数据'}

## 分析要求
请从以下几个维度进行专业分析，并给出具体的投资建议：

### 1. 技术分析
- 分析价格趋势（上涨/下跌/横盘）
- 识别关键的支撑位和阻力位
- 评估当前价格的技术指标信号
- 预测短期价格走势

### 2. 基本面分析
- 评估当前估值水平（基于市盈率等指标）
- 分析公司的财务健康状况
- 行业地位和竞争优势
- 宏观经济环境影响

### 3. 风险评估
- 识别主要风险因素
- 评估价格波动性
- 市场情绪和流动性风险
- 行业特定风险

### 4. 投资建议
- 明确给出买入/持有/卖出建议
- 提供目标价位区间
- 建议持有期限
- 风险控制措施

### 5. 置信度评估
- 对分析结果的置信度（1-10分）
- 影响置信度的关键因素

## 输出格式要求
请用中文回答，保持专业性的同时确保普通投资者能够理解。
分析要客观、平衡，既要指出机会也要提醒风险。
最后请给出一个综合评分（1-10分，10分最好）。

开始分析：
`

    // 调用Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
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
            maxOutputTokens: 2048,
          }
        })
      }
    )

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json()
      throw new Error(`Gemini API错误: ${errorData.error?.message || '未知错误'}`)
    }

    const geminiData = await geminiResponse.json()
    const analysisText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!analysisText) {
      throw new Error('Gemini返回的分析结果为空')
    }

    // 简单解析分析结果，提取关键信息
    const parseAnalysisResult = (text: string) => {
      // 尝试提取投资建议
      let recommendation = 'HOLD'
      const lowerText = text.toLowerCase()
      
      if (lowerText.includes('买入') || lowerText.includes('建议购买')) {
        recommendation = 'BUY'
      } else if (lowerText.includes('卖出') || lowerText.includes('建议卖出')) {
        recommendation = 'SELL'
      }

      // 尝试提取置信度分数
      const confidenceMatch = text.match(/置信度[：:]\s*(\d+)/i) || text.match(/(\d+)分/i)
      const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) / 10 : 0.7

      // 尝试提取综合评分
      const scoreMatch = text.match(/综合评分[：:]\s*(\d+)/i) || text.match(/评分[：:]\s*(\d+)/i)
      const score = scoreMatch ? parseInt(scoreMatch[1]) : null

      return {
        recommendation,
        confidence: Math.min(1, Math.max(0, confidence)),
        score,
        full_analysis: text
      }
    }

    const analysisResult = parseAnalysisResult(analysisText)

    // 返回分析结果
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ticker,
          analysis_type: analysisType,
          recommendation: analysisResult.recommendation,
          confidence_score: analysisResult.confidence,
          overall_score: analysisResult.score,
          analysis_text: analysisResult.full_analysis,
          timestamp: new Date().toISOString(),
          // 可选：如果需要保存到数据库，可以在这里添加逻辑
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('AI分析错误:', error)
    return new Response(
      JSON.stringify({ 
        error: '分析服务暂时不可用',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
