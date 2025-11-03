// 实时市场指数（东财API）
// GET /api/realtime/market-indices

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest) {
  try {
    // 上证指数(1.000001)、深证成指(0.399001)、创业板指(0.399006)
    const secids = '1.000001,0.399001,0.399006'
    const fields = 'f2,f3,f4,f12,f13,f14' // 现价, 涨跌幅, 涨跌额, 代码, 市场, 名称
    const url = `https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&invt=2&fields=${fields}&secids=${secids}`

    const res = await fetch(url, {
      headers: {
        // 重要：东财接口需要来源头
        'Referer': 'https://quote.eastmoney.com',
        'User-Agent': 'Mozilla/5.0'
      },
      cache: 'no-store'
    })
    if (!res.ok) {
      return NextResponse.json({ error: '东财API失败', status: res.status }, { status: 502 })
    }
    const json = await res.json()
    const list = json?.data?.diff || []

    const mapped = list.map((item: any) => ({
      code: `${item.f13}.${item.f12}`,
      name: item.f14,
      price: Number(item.f2 ?? 0),
      change: Number(item.f4 ?? 0),
      changePercent: Number(item.f3 ?? 0),
      volume: 0,
      turnover: 0,
      isTestData: false,
      dataSource: 'EASTMONEY',
      updateTime: new Date().toISOString()
    }))

    return NextResponse.json({ success: true, data: mapped, meta: { total: mapped.length, source: 'eastmoney' } })
  } catch (e: any) {
    return NextResponse.json({ error: '服务器内部错误', details: e?.message || String(e) }, { status: 500 })
  }
}

