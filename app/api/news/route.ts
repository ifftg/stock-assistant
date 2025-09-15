import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// 直接从 Supabase news 表读取最新新闻
async function fetchLatestNewsFromDB(limit: number = 10, category?: string | null) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) return { data: [], error: '缺少 Supabase 环境变量' }

  const supabase = createClient(supabaseUrl, supabaseKey)
  let q = supabase
    .from('news')
    .select('*')
    .order('publish_time', { ascending: false })
    .limit(limit)

  if (category) q = q.eq('category', category)

  const { data, error } = await q
  if (error) return { data: [], error: error.message }
  return { data: data || [], error: null }
}


// GET /api/news - 获取财经新闻
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')

    // 从数据库读取最新新闻
    const { data: news, error } = await fetchLatestNewsFromDB(limit, category)
    if (error) {
      return NextResponse.json({ error: '获取新闻失败', details: error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: news,
      meta: {
        total: news.length,
        isFromDatabase: true,
        isRealTime: false
      }
    })

  } catch (error) {
    console.error('获取新闻失败:', error)
    return NextResponse.json(
      { error: '获取新闻失败' },
      { status: 500 }
    )
  }
}
