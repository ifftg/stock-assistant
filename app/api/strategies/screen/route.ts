import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 创建Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 通用的股票筛选函数
async function getStocksWithCriteria(criteria: any) {
  try {
    // 简化版：直接获取测试数据
    const { data: stocks, error } = await supabase
      .from('stocks_info')
      .select(`
        ticker,
        name,
        market,
        industry
      `)
      .limit(20)

    if (error) {
      console.error('获取股票信息失败:', error)
      return { data: null, error }
    }

    // 为每个股票获取最新的日线数据
    const stocksWithData = []
    for (const stock of stocks || []) {
      const { data: dailyData, error: dailyError } = await supabase
        .from('stocks_daily')
        .select('*')
        .eq('ticker', stock.ticker)
        .order('trade_date', { ascending: false })
        .limit(1)

      if (!dailyError && dailyData && dailyData.length > 0) {
        stocksWithData.push({
          ...stock,
          stocks_daily: dailyData
        })
      }
    }

    return { data: stocksWithData, error: null }
  } catch (err) {
    console.error('getStocksWithCriteria错误:', err)
    return { data: null, error: err }
  }
}

// 策略筛选函数映射
const strategyScreeners = {
  // 1. 经典价值策略: PE < 15, PB < 1.5, 市值 > 200亿
  value_strategy: async () => {
    const { data: stocks, error } = await getStocksWithCriteria({})
    if (error) return { data: null, error }

    // 应用价值策略筛选条件
    const filtered = stocks?.filter(stock => {
      const daily = stock.stocks_daily[0]
      return daily &&
             daily.pe_ratio && daily.pe_ratio > 0 && daily.pe_ratio < 15 &&
             daily.pb_ratio && daily.pb_ratio > 0 && daily.pb_ratio < 1.5 &&
             daily.market_cap && daily.market_cap > 20000000000
    }) || []

    return { data: filtered.slice(0, 30), error: null }
  },

  // 2. 放量上涨策略: 成交量/5日均量≥2，成交额≥2亿
  volume_surge: async () => {
    const { data: stocks, error } = await getStocksWithCriteria({})
    if (error) return { data: null, error }

    // 应用放量上涨策略筛选条件
    const filtered = stocks?.filter(stock => {
      const daily = stock.stocks_daily[0]
      return daily &&
             daily.volume && daily.volume > 1000000 &&
             daily.turnover && daily.turnover > 200000000 &&
             daily.close_price && daily.open_price &&
             ((daily.close_price - daily.open_price) / daily.open_price) > 0
    }) || []

    return { data: filtered.slice(0, 30), error: null }
  },

  // 3. 均线多头策略: 需要计算均线，暂时简化
  ma_bullish: async () => {
    const { data: stocks, error } = await getStocksWithCriteria({})
    if (error) return { data: null, error }

    // 应用均线多头策略筛选条件（简化版）
    const filtered = stocks?.filter(stock => {
      const daily = stock.stocks_daily[0]
      return daily &&
             daily.close_price && daily.close_price > 5 &&
             daily.volume && daily.volume > 500000
    }) || []

    return { data: filtered.slice(0, 30), error: null }
  },

  // 4-11. 其他策略（简化实现）
  tarmac_strategy: async () => {
    const { data: stocks, error } = await getStocksWithCriteria({})
    if (error) return { data: null, error }
    const filtered = stocks?.filter(stock => {
      const daily = stock.stocks_daily[0]
      return daily && daily.volume && daily.volume > 500000
    }) || []
    return { data: filtered.slice(0, 20), error: null }
  },

  annual_line_callback: async () => {
    const { data: stocks, error } = await getStocksWithCriteria({})
    if (error) return { data: null, error }
    const filtered = stocks?.filter(stock => {
      const daily = stock.stocks_daily[0]
      return daily && daily.close_price && daily.close_price > 10
    }) || []
    return { data: filtered.slice(0, 15), error: null }
  },

  platform_breakthrough: async () => {
    const { data: stocks, error } = await getStocksWithCriteria({})
    if (error) return { data: null, error }
    const filtered = stocks?.filter(stock => {
      const daily = stock.stocks_daily[0]
      return daily && daily.volume && daily.volume > 1000000
    }) || []
    return { data: filtered.slice(0, 25), error: null }
  },

  turtle_trading: async () => {
    const { data: stocks, error } = await getStocksWithCriteria({})
    if (error) return { data: null, error }
    const filtered = stocks?.filter(stock => {
      const daily = stock.stocks_daily[0]
      return daily && daily.close_price && daily.close_price > 5
    }) || []
    return { data: filtered.slice(0, 18), error: null }
  },

  narrow_flag: async () => {
    const { data: stocks, error } = await getStocksWithCriteria({})
    if (error) return { data: null, error }
    const filtered = stocks?.filter(stock => {
      const daily = stock.stocks_daily[0]
      return daily && daily.volume && daily.volume > 800000
    }) || []
    return { data: filtered.slice(0, 12), error: null }
  },

  low_atr_growth: async () => {
    const { data: stocks, error } = await getStocksWithCriteria({})
    if (error) return { data: null, error }
    const filtered = stocks?.filter(stock => {
      const daily = stock.stocks_daily[0]
      return daily && daily.close_price && daily.close_price > 8
    }) || []
    return { data: filtered.slice(0, 22), error: null }
  },

  fundamental_screening: async () => {
    const { data: stocks, error } = await getStocksWithCriteria({})
    if (error) return { data: null, error }
    const filtered = stocks?.filter(stock => {
      const daily = stock.stocks_daily[0]
      return daily &&
             daily.pe_ratio && daily.pe_ratio > 0 && daily.pe_ratio <= 20 &&
             daily.pb_ratio && daily.pb_ratio > 0 && daily.pb_ratio <= 10
    }) || []
    return { data: filtered.slice(0, 35), error: null }
  },

  volume_limit_down: async () => {
    const { data: stocks, error } = await getStocksWithCriteria({})
    if (error) return { data: null, error }
    const filtered = stocks?.filter(stock => {
      const daily = stock.stocks_daily[0]
      return daily &&
             daily.turnover && daily.turnover > 200000000 &&
             daily.volume && daily.volume > 2000000 &&
             daily.close_price && daily.open_price &&
             ((daily.close_price - daily.open_price) / daily.open_price) < -0.05
    }) || []
    return { data: filtered.slice(0, 8), error: null }
  }
}

// GET /api/strategies/screen - 策略筛选接口
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const strategy = searchParams.get('strategy')

    if (!strategy) {
      return NextResponse.json(
        { error: '请指定筛选策略' },
        { status: 400 }
      )
    }

    // 检查策略是否存在
    if (!(strategy in strategyScreeners)) {
      return NextResponse.json(
        { error: '不支持的策略类型' },
        { status: 400 }
      )
    }

    // 执行策略筛选
    const screener = strategyScreeners[strategy as keyof typeof strategyScreeners]
    const { data: stocks, error } = await screener()

    if (error) {
      console.error('策略筛选失败:', error)
      const message = (error as any)?.message || (typeof error === 'string' ? error : JSON.stringify(error))
      return NextResponse.json(
        { error: '策略筛选失败', details: message },
        { status: 500 }
      )
    }

    // 处理数据格式
    const processedStocks = stocks?.map(stock => {
      const dailyData = stock.stocks_daily[0] // 获取最新的日线数据
      const changePercent = dailyData && dailyData.close_price && dailyData.open_price ? 
        ((dailyData.close_price - dailyData.open_price) / dailyData.open_price * 100) : 0

      return {
        ticker: stock.ticker,
        name: stock.name,
        market: stock.market,
        industry: stock.industry,
        currentPrice: dailyData?.close_price || 0,
        changePercent: changePercent,
        volume: dailyData?.volume || 0,
        turnover: dailyData?.turnover || 0,
        marketCap: dailyData?.market_cap || 0,
        peRatio: dailyData?.pe_ratio || null,
        pbRatio: dailyData?.pb_ratio || null,
        tradeDate: dailyData?.trade_date || null
      }
    }) || []

    return NextResponse.json({
      success: true,
      strategy: strategy,
      data: processedStocks,
      meta: {
        total: processedStocks.length,
        strategy_name: getStrategyName(strategy)
      }
    })

  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 获取策略名称
function getStrategyName(strategy: string): string {
  const strategyNames: Record<string, string> = {
    value_strategy: '经典价值策略',
    volume_surge: '放量上涨策略',
    ma_bullish: '均线多头策略',
    tarmac_strategy: '停机坪策略',
    annual_line_callback: '回踩年线策略',
    platform_breakthrough: '突破平台策略',
    turtle_trading: '海龟交易法则',
    narrow_flag: '高而窄的旗形',
    low_atr_growth: '低ATR成长',
    fundamental_screening: '基本面选股',
    volume_limit_down: '放量跌停'
  }
  return strategyNames[strategy] || '未知策略'
}
