// Supabase Edge Function: 股票数据获取
// 复制此代码到Supabase Dashboard的stock-data函数中

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
    // 获取环境变量
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const alphaVantageKey = Deno.env.get('ALPHA_VANTAGE_API_KEY')!

    // 创建Supabase客户端
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 获取请求参数
    const url = new URL(req.url)
    const ticker = url.searchParams.get('ticker')
    const period = url.searchParams.get('period') || '1M' // 1D, 1W, 1M, 3M, 1Y
    const forceUpdate = url.searchParams.get('force') === 'true'

    if (!ticker) {
      return new Response(
        JSON.stringify({ error: '股票代码不能为空' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 1. 检查数据库中是否有最新数据
    const { data: latestData, error: latestError } = await supabase
      .from('stocks_daily')
      .select('trade_date')
      .eq('ticker', ticker)
      .order('trade_date', { ascending: false })
      .limit(1)

    const today = new Date().toISOString().split('T')[0]
    const needUpdate = forceUpdate || !latestData || latestData.length === 0 || latestData[0].trade_date < today

    // 2. 如果需要更新，从Alpha Vantage获取数据
    if (needUpdate) {
      try {
        // 获取股票基础信息
        const overviewResponse = await fetch(
          `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${alphaVantageKey}`
        )
        const overviewData = await overviewResponse.json()

        // 获取日线数据
        const dailyResponse = await fetch(
          `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=${alphaVantageKey}`
        )
        const dailyData = await dailyResponse.json()

        if (dailyData['Error Message']) {
          throw new Error('股票代码无效或API限制')
        }

        // 3. 更新股票基础信息
        if (overviewData.Symbol) {
          const { error: upsertError } = await supabase
            .from('stocks_info')
            .upsert({
              ticker: ticker,
              name: overviewData.Name || ticker,
              industry: overviewData.Industry || '未知',
              sector: overviewData.Sector || '未知',
              market: overviewData.Exchange || '未知',
              description: overviewData.Description || '',
              updated_at: new Date().toISOString()
            })

          if (upsertError) {
            console.error('更新股票信息失败:', upsertError)
          }
        }

        // 4. 处理并插入日线数据
        const timeSeries = dailyData['Time Series (Daily)']
        if (timeSeries) {
          const dailyRecords = Object.entries(timeSeries).map(([date, data]: [string, any]) => ({
            ticker: ticker,
            trade_date: date,
            open_price: parseFloat(data['1. open']),
            high_price: parseFloat(data['2. high']),
            low_price: parseFloat(data['3. low']),
            close_price: parseFloat(data['4. close']),
            volume: parseInt(data['5. volume']),
            pe_ratio: overviewData.PERatio ? parseFloat(overviewData.PERatio) : null,
            pb_ratio: overviewData.PriceToBookRatio ? parseFloat(overviewData.PriceToBookRatio) : null,
            market_cap: overviewData.MarketCapitalization ? parseFloat(overviewData.MarketCapitalization) : null,
            created_at: new Date().toISOString()
          }))

          // 批量插入数据（处理冲突）
          const { error: insertError } = await supabase
            .from('stocks_daily')
            .upsert(dailyRecords, { 
              onConflict: 'ticker,trade_date',
              ignoreDuplicates: false 
            })

          if (insertError) {
            console.error('插入股票数据失败:', insertError)
          }
        }
      } catch (apiError) {
        console.error('API调用失败:', apiError)
        // 如果API失败，继续返回数据库中的现有数据
      }
    }

    // 5. 根据period参数确定查询范围
    let daysBack = 30
    switch (period) {
      case '1D': daysBack = 1; break
      case '1W': daysBack = 7; break
      case '1M': daysBack = 30; break
      case '3M': daysBack = 90; break
      case '1Y': daysBack = 365; break
    }

    // 6. 从数据库获取数据
    const { data: stockData, error: dataError } = await supabase
      .from('stocks_daily')
      .select('*')
      .eq('ticker', ticker)
      .order('trade_date', { ascending: false })
      .limit(daysBack)

    if (dataError) {
      return new Response(
        JSON.stringify({ error: '获取股票数据失败' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 7. 获取股票基础信息
    const { data: stockInfo, error: infoError } = await supabase
      .from('stocks_info')
      .select('*')
      .eq('ticker', ticker)
      .single()

    // 8. 计算技术指标
    const calculateTechnicalIndicators = (data: any[]) => {
      if (data.length < 5) return {}

      const prices = data.map(d => d.close_price).reverse()
      const volumes = data.map(d => d.volume).reverse()

      // 简单移动平均线
      const sma5 = prices.slice(-5).reduce((a, b) => a + b, 0) / 5
      const sma20 = prices.length >= 20 ? prices.slice(-20).reduce((a, b) => a + b, 0) / 20 : null

      // 价格变化
      const priceChange = prices[prices.length - 1] - prices[prices.length - 2]
      const priceChangePercent = (priceChange / prices[prices.length - 2]) * 100

      // 波动率（简化版）
      const returns = prices.slice(1).map((price, i) => (price - prices[i]) / prices[i])
      const volatility = Math.sqrt(returns.reduce((sum, ret) => sum + ret * ret, 0) / returns.length) * Math.sqrt(252)

      return {
        sma5: sma5.toFixed(2),
        sma20: sma20?.toFixed(2),
        price_change: priceChange.toFixed(2),
        price_change_percent: priceChangePercent.toFixed(2),
        volatility: (volatility * 100).toFixed(2)
      }
    }

    const technicalIndicators = calculateTechnicalIndicators(stockData)

    // 9. 返回结果
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          stock_info: stockInfo,
          stock_data: stockData.reverse(), // 按时间正序返回
          technical_indicators: technicalIndicators,
          period: period,
          last_updated: stockData[0]?.created_at || new Date().toISOString()
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('股票数据获取错误:', error)
    return new Response(
      JSON.stringify({ 
        error: '数据服务暂时不可用',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
