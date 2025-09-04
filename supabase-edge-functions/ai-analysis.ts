// Supabase Edge Function: AI股票分析
// 文件路径: supabase/functions/ai-analysis/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    // 获取请求数据
    const { ticker, user_id } = await req.json()
    
    if (!ticker || !user_id) {
      throw new Error('缺少必要参数：ticker 或 user_id')
    }

    // 初始化Supabase客户端
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 检查用户今日AI分析次数
    const today = new Date().toISOString().split('T')[0]
    const { data: todayAnalyses, error: countError } = await supabase
      .from('ai_analyses')
      .select('id')
      .eq('user_id', user_id)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`)

    if (countError) {
      throw new Error(`查询分析次数失败: ${countError.message}`)
    }

    // 检查次数限制（测试阶段：每日10次）
    const dailyLimit = 10
    if (todayAnalyses && todayAnalyses.length >= dailyLimit) {
      return new Response(JSON.stringify({
        error: `今日AI分析次数已达上限（${dailyLimit}次），请明日再试`
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 获取股票基础数据
    const { data: stockData, error: stockError } = await supabase
      .from('stocks_daily')
      .select('*')
      .eq('ticker', ticker)
      .order('trade_date', { ascending: false })
      .limit(1)

    if (stockError) {
      throw new Error(`获取股票数据失败: ${stockError.message}`)
    }

    if (!stockData || stockData.length === 0) {
      throw new Error(`未找到股票 ${ticker} 的数据`)
    }

    const stock = stockData[0]

    // 构建AI分析提示词
    const prompt = `请分析股票${ticker}的投资价值：

基本信息：
- 股票代码：${stock.ticker}
- 最新价格：${stock.close_price}元
- 市盈率：${stock.pe_ratio}
- 市净率：${stock.pb_ratio}
- 市值：${(stock.market_cap / 100000000).toFixed(2)}亿元

请从以下角度进行分析：
1. 估值水平分析（PE、PB是否合理）
2. 技术面分析（价格趋势、支撑阻力）
3. 风险评估（市值规模、流动性）
4. 投资建议（买入/持有/卖出，目标价位）

请用专业但易懂的语言，控制在300字以内。`

    // 调用Gemini API
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('Gemini API密钥未配置')
    }

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
            maxOutputTokens: 1024,
          }
        })
      }
    )

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API调用失败: ${geminiResponse.statusText}`)
    }

    const geminiData = await geminiResponse.json()
    
    if (!geminiData.candidates || geminiData.candidates.length === 0) {
      throw new Error('Gemini API返回数据异常')
    }

    const analysisText = geminiData.candidates[0].content.parts[0].text

    // 保存分析结果到数据库
    const { data: savedAnalysis, error: saveError } = await supabase
      .from('ai_analyses')
      .insert({
        user_id: user_id,
        ticker: ticker,
        analysis_text: analysisText,
        created_at: new Date().toISOString()
      })
      .select()

    if (saveError) {
      console.error('保存分析结果失败:', saveError)
      // 不抛出错误，因为分析已经完成
    }

    // 返回分析结果
    return new Response(JSON.stringify({
      success: true,
      ticker: ticker,
      analysis: analysisText,
      stock_info: {
        price: stock.close_price,
        pe_ratio: stock.pe_ratio,
        pb_ratio: stock.pb_ratio,
        market_cap: stock.market_cap
      },
      remaining_analyses: dailyLimit - (todayAnalyses?.length || 0) - 1
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('AI分析错误:', error)
    
    return new Response(JSON.stringify({
      error: error.message || '分析过程中发生未知错误'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

/* 
部署说明：
1. 在Supabase项目中创建新的Edge Function
2. 将此代码复制到 supabase/functions/ai-analysis/index.ts
3. 设置环境变量：
   - GEMINI_API_KEY: 您的Gemini API密钥
   - SUPABASE_URL: 自动提供
   - SUPABASE_SERVICE_ROLE_KEY: 自动提供
4. 部署命令：supabase functions deploy ai-analysis
*/
