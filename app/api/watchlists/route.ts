// 用户自选股 API
// 文件: app/api/watchlists/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY // 可选，仅用于服务端写入
  return { url, anon, service }
}

function getBearerToken(req: NextRequest): string | null {
  const auth = req.headers.get('authorization') || req.headers.get('Authorization')
  if (!auth) return null
  const m = auth.match(/^Bearer\s+(.+)$/i)
  return m ? m[1] : null
}

function clientWithToken(url: string, anon: string, token: string): SupabaseClient {
  return createClient(url, anon, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  })
}

async function getUserFromToken(url: string, anon: string, token: string) {
  const sb = clientWithToken(url, anon, token)
  const { data, error } = await sb.auth.getUser()
  if (error || !data?.user) return { user: null, error: error || new Error('未找到用户') }
  return { user: data.user, error: null }
}

// GET /api/watchlists - 获取当前用户的自选股
export async function GET(req: NextRequest) {
  const { url, anon } = getEnv()
  if (!url || !anon) {
    return NextResponse.json({ error: '服务未正确配置（缺少 Supabase 环境变量）' }, { status: 500 })
  }

  const token = getBearerToken(req)
  if (!token) {
    return NextResponse.json({ error: '未认证：请在请求头 Authorization: Bearer <access_token> 传入 Supabase 会话' }, { status: 401 })
  }

  try {
    const authed = clientWithToken(url, anon, token)
    // 使用 RLS + 用户 JWT 进行查询
    const { data, error } = await authed
      .from('watchlists')
      .select(`
        ticker,
        added_at,
        notes,
        stocks_info:ticker ( name, industry, market )
      `)
      .order('added_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: '获取自选股失败', details: error.message }, { status: 500 })
    }

    const result = (data || []).map((row: any) => ({
      ticker: row.ticker,
      name: row.stocks_info?.name ?? null,
      industry: row.stocks_info?.industry ?? null,
      market: row.stocks_info?.market ?? null,
      addedAt: row.added_at,
      notes: row.notes ?? null
    }))

    return NextResponse.json({ success: true, data: result, meta: { total: result.length } })
  } catch (e: any) {
    return NextResponse.json({ error: '服务器内部错误', details: e?.message || String(e) }, { status: 500 })
  }
}

// POST /api/watchlists - 添加自选股 { ticker, notes? }
export async function POST(req: NextRequest) {
  const { url, anon, service } = getEnv()
  if (!url || !anon) {
    return NextResponse.json({ error: '服务未正确配置（缺少 Supabase 环境变量）' }, { status: 500 })
  }

  const token = getBearerToken(req)
  if (!token) {
    return NextResponse.json({ error: '未认证：请在请求头 Authorization: Bearer <access_token> 传入 Supabase 会话' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const ticker = body?.ticker?.toString().trim()
  const notes = body?.notes?.toString().trim() || null
  if (!ticker) {
    return NextResponse.json({ error: '参数缺失：ticker' }, { status: 400 })
  }

  try {
    // 先获取用户 ID
    const { user, error: userErr } = await getUserFromToken(url, anon, token)
    if (userErr || !user) {
      return NextResponse.json({ error: '会话无效或已过期' }, { status: 401 })
    }

    // 优先使用服务密钥以避免 RLS 插入策略不全导致失败
    const writer = service ? createClient(url, service) : clientWithToken(url, anon, token)

    const { data, error } = await writer
      .from('watchlists')
      .upsert({ user_id: user.id, ticker, notes }, { onConflict: 'user_id,ticker' })
      .select('ticker, added_at, notes')
      .single()

    if (error) {
      const hint = !service ? '（建议在环境变量中配置 SUPABASE_SERVICE_ROLE_KEY，或在数据库为 watchlists 添加 INSERT WITH CHECK 策略：WITH CHECK (auth.uid() = user_id)）' : ''
      return NextResponse.json({ error: '添加自选股失败', details: error.message + hint }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: { ticker: data.ticker, addedAt: data.added_at, notes: data.notes } }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: '服务器内部错误', details: e?.message || String(e) }, { status: 500 })
  }
}

// DELETE /api/watchlists?ticker=000001 或 body: { ticker }
export async function DELETE(req: NextRequest) {
  const { url, anon, service } = getEnv()
  if (!url || !anon) {
    return NextResponse.json({ error: '服务未正确配置（缺少 Supabase 环境变量）' }, { status: 500 })
  }

  const token = getBearerToken(req)
  if (!token) {
    return NextResponse.json({ error: '未认证：请在请求头 Authorization: Bearer <access_token> 传入 Supabase 会话' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const qpTicker = searchParams.get('ticker')
  const body = qpTicker ? null : await req.json().catch(() => null)
  const tickerNormalized: string | null = (qpTicker ? String(qpTicker) : (body?.ticker ? String(body.ticker) : '')).trim() || null
  if (!tickerNormalized) {
    return NextResponse.json({ error: '参数缺失：ticker' }, { status: 400 })
  }

  try {
    const { user, error: userErr } = await getUserFromToken(url, anon, token)
    if (userErr || !user) {
      return NextResponse.json({ error: '会话无效或已过期' }, { status: 401 })
    }

    const writer = service ? createClient(url, service) : clientWithToken(url, anon, token)

    const { error } = await writer
      .from('watchlists')
      .delete()
      .eq('user_id', user.id)
      .eq('ticker', tickerNormalized)

    if (error) {
      const hint = !service ? '（建议在环境变量中配置 SUPABASE_SERVICE_ROLE_KEY，或在数据库为 watchlists 添加 DELETE USING 策略：USING (auth.uid() = user_id)）' : ''
      return NextResponse.json({ error: '删除自选股失败', details: error.message + hint }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: '服务器内部错误', details: e?.message || String(e) }, { status: 500 })
  }
}

