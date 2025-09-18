// 股票搜索 API（基于 Supabase 数据库）
// 用法: GET /api/stocks_search?q=300 | q=平安 | q=pingan

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: '服务未正确配置（缺少 Supabase 环境变量）' }, { status: 500 })
  }
  const supabase = createClient(supabaseUrl, supabaseKey)

  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') || '').trim()
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
  if (!q) {
    return NextResponse.json({ success: true, data: [], meta: { total: 0 } })
  }

  try {
    // 通过 OR 条件在 ticker / name 字段模糊匹配
    const { data, error } = await supabase
      .from('stocks_info')
      .select(`
        ticker,
        name,
        market,
        industry,
        stocks_daily!inner(
          trade_date,
          open_price,
          close_price,
          volume,
          turnover,
          pe_ratio,
          pb_ratio,
          market_cap,
          prev_close
        )
      `)
      .order('trade_date', { foreignTable: 'stocks_daily', ascending: false })
      .limit(1, { foreignTable: 'stocks_daily' })
      .limit(limit)
      .or(`name.ilike.%${q}%,ticker.ilike.%${q}%`)

    if (error) {
      return NextResponse.json({ error: '搜索失败', details: error.message }, { status: 500 })
    }

    const results = (data || []).map((row: any) => {
      const d = row.stocks_daily?.[0]
      const ref = d?.prev_close && d.prev_close > 0 ? d.prev_close : d?.open_price
      const changePercent = d && ref ? ((d.close_price - ref) / ref * 100) : 0
      return {
        ticker: row.ticker,
        name: row.name,
        market: row.market,
        industry: row.industry,
        price: d?.close_price || 0,
        changePercent: Number(changePercent.toFixed(2))
      }
    })

    return NextResponse.json({ success: true, data: results, meta: { total: results.length } })
  } catch (e: any) {
    return NextResponse.json({ error: '服务器内部错误', details: e?.message || String(e) }, { status: 500 })
  }
}

