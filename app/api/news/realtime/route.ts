// 实时财经新闻API（从东方财富获取）
// GET /api/news/realtime

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// 从东方财富获取实时财经新闻
async function fetchRealtimeNewsFromEastmoney(limit: number = 10) {
  try {
    // 东方财富财经新闻API
    const url = `https://np-anotice-stock.eastmoney.com/api/security/ann?ann_type=SHA%2CSZA%2CBJA&client_source=web&page_index=1&page_size=${limit}&s_type=title&cb=`
    
    const response = await fetch(url, {
      headers: {
        'Referer': 'https://data.eastmoney.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`东方财富API请求失败: ${response.status}`)
    }

    const text = await response.text()
    // 移除JSONP回调包装
    const jsonText = text.replace(/^[^{]*\(/, '').replace(/\);?$/, '')
    const data = JSON.parse(jsonText)

    if (!data.data || !data.data.list) {
      return { data: [], error: null }
    }

    // 转换数据格式
    const news = data.data.list.map((item: any) => ({
      id: item.art_code || Math.random().toString(36).substr(2, 9),
      title: item.title || '无标题',
      summary: item.summary || item.title || '',
      source: item.org_name || '东方财富',
      url: item.url || `https://data.eastmoney.com/notices/detail/${item.art_code}.html`,
      publish_time: item.notice_date || new Date().toISOString(),
      category: item.columns || '公告',
      importance_level: item.is_important ? 4 : 2,
      created_at: new Date().toISOString()
    }))

    return { data: news, error: null }
  } catch (error: any) {
    console.error('获取东方财富新闻失败:', error)
    return { data: [], error: error.message }
  }
}

// 保存新闻到数据库
async function saveNewsToDatabase(news: any[]) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return { error: '缺少 Supabase 环境变量' }
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // 批量插入新闻，忽略重复的
    const { data, error } = await supabase
      .from('financial_news')
      .upsert(news, { 
        onConflict: 'title,publish_time',
        ignoreDuplicates: true 
      })

    if (error) {
      console.error('保存新闻到数据库失败:', error)
      return { error: error.message }
    }

    return { data, error: null }
  } catch (error: any) {
    console.error('数据库操作失败:', error)
    return { error: error.message }
  }
}

// GET /api/news/realtime - 获取实时财经新闻
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
    const saveToDb = searchParams.get('save') === 'true'

    // 从东方财富获取实时新闻
    const { data: news, error } = await fetchRealtimeNewsFromEastmoney(limit)
    
    if (error) {
      return NextResponse.json({ 
        error: '获取实时新闻失败', 
        details: error 
      }, { status: 500 })
    }

    // 如果需要保存到数据库
    if (saveToDb && news.length > 0) {
      const { error: saveError } = await saveNewsToDatabase(news)
      if (saveError) {
        console.error('保存新闻失败:', saveError)
        // 不影响返回结果，只记录错误
      }
    }

    return NextResponse.json({
      success: true,
      data: news,
      meta: {
        total: news.length,
        isRealTime: true,
        source: 'eastmoney',
        savedToDatabase: saveToDb
      }
    })

  } catch (error) {
    console.error('获取实时新闻失败:', error)
    return NextResponse.json(
      { error: '获取实时新闻失败' },
      { status: 500 }
    )
  }
}

// POST /api/news/realtime - 手动触发新闻更新并保存到数据库
export async function POST(request: NextRequest) {
  try {
    const { limit = 20 } = await request.json().catch(() => ({}))

    // 获取新闻并保存到数据库
    const { data: news, error } = await fetchRealtimeNewsFromEastmoney(limit)
    
    if (error) {
      return NextResponse.json({ 
        error: '获取新闻失败', 
        details: error 
      }, { status: 500 })
    }

    if (news.length > 0) {
      const { error: saveError } = await saveNewsToDatabase(news)
      if (saveError) {
        return NextResponse.json({ 
          error: '保存新闻失败', 
          details: saveError 
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: `成功获取并保存 ${news.length} 条新闻`,
      data: news,
      meta: {
        total: news.length,
        source: 'eastmoney',
        savedToDatabase: true
      }
    })

  } catch (error) {
    console.error('更新新闻失败:', error)
    return NextResponse.json(
      { error: '更新新闻失败' },
      { status: 500 }
    )
  }
}
