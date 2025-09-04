// 股票数据API路由
// 文件路径: app/api/stocks/route.ts

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// 强制动态渲染
export const dynamic = 'force-dynamic'

// 创建Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET /api/stocks - 获取股票列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const includeTestData = searchParams.get('includeTestData') === 'true'

    // 构建查询
    let query = supabase
      .from('stocks_info')
      .select(`
        ticker,
        name,
        market,
        industry,
        data_source,
        is_test_data,
        created_at,
        stocks_daily!inner(
          trade_date,
          open_price,
          close_price,
          high_price,
          low_price,
          volume,
          turnover,
          pe_ratio,
          pb_ratio,
          market_cap,
          data_source,
          is_test_data
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    // 如果不包含测试数据，则过滤掉
    if (!includeTestData) {
      query = query.eq('is_test_data', false)
    }

    const { data: stocks, error } = await query

    if (error) {
      console.error('获取股票数据失败:', error)
      return NextResponse.json(
        { error: '获取股票数据失败', details: error.message },
        { status: 500 }
      )
    }

    // 处理数据格式，计算涨跌幅
    const processedStocks = stocks?.map(stock => {
      const dailyData = stock.stocks_daily[0] // 获取最新的日线数据
      const changePercent = dailyData ? 
        ((dailyData.close_price - dailyData.open_price) / dailyData.open_price * 100) : 0

      return {
        ticker: stock.ticker,
        name: stock.name,
        market: stock.market,
        industry: stock.industry,
        price: dailyData?.close_price || 0,
        changePercent: parseFloat(changePercent.toFixed(2)),
        volume: dailyData?.volume || 0,
        turnover: dailyData?.turnover || 0,
        peRatio: dailyData?.pe_ratio || 0,
        pbRatio: dailyData?.pb_ratio || 0,
        marketCap: dailyData?.market_cap || 0,
        isTestData: stock.is_test_data || dailyData?.is_test_data || false,
        dataSource: stock.data_source || dailyData?.data_source || 'API',
        lastUpdate: dailyData?.trade_date || stock.created_at
      }
    }) || []

    return NextResponse.json({
      success: true,
      data: processedStocks,
      meta: {
        total: processedStocks.length,
        hasTestData: processedStocks.some(stock => stock.isTestData),
        testDataCount: processedStocks.filter(stock => stock.isTestData).length
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

// POST /api/stocks - 添加新股票（暂时不实现）
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: '暂不支持添加股票功能' },
    { status: 501 }
  )
}

/*
API使用示例：

1. 获取所有股票（包含测试数据）：
   GET /api/stocks?includeTestData=true&limit=20

2. 获取生产数据（不包含测试数据）：
   GET /api/stocks?includeTestData=false&limit=10

3. 响应格式：
{
  "success": true,
  "data": [
    {
      "ticker": "000001",
      "name": "平安银行",
      "market": "A股",
      "industry": "银行",
      "price": 12.34,
      "changePercent": 0.32,
      "volume": 123000000,
      "turnover": 1520000000,
      "peRatio": 8.5,
      "pbRatio": 0.9,
      "marketCap": 245600000000,
      "isTestData": true,
      "dataSource": "TEST",
      "lastUpdate": "2024-01-15"
    }
  ],
  "meta": {
    "total": 5,
    "hasTestData": true,
    "testDataCount": 5
  }
}
*/
