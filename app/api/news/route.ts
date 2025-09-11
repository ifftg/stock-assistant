import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/news - 获取财经新闻
export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: '服务未正确配置（缺少 Supabase 环境变量）' },
      { status: 500 }
    )
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const includeTestData = searchParams.get('includeTestData') === 'true'

    // 构建查询
    let query = supabase
      .from('financial_news')
      .select('*')
      .order('publish_time', { ascending: false })
      .limit(limit)

    // 如果指定了类别，则过滤
    if (category) {
      query = query.eq('category', category)
    }

    // 如果不包含测试数据，则过滤掉（假设有 is_test_data 字段）
    if (!includeTestData) {
      query = query.neq('source', 'TEST')
    }

    const { data: news, error } = await query

    if (error) {
      console.error('获取新闻数据失败:', error)
      
      // 如果表不存在或没有数据，返回模拟数据
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
        const mockNews = [
          {
            id: 1,
            title: '央行宣布降准0.5个百分点，释放流动性约1万亿元',
            summary: '中国人民银行决定于2024年1月15日下调金融机构存款准备金率0.5个百分点，此次降准将释放长期资金约1万亿元。',
            source: '央行官网',
            url: '#',
            publish_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2小时前
            category: '政策',
            importance_level: 5,
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            title: 'A股三大指数集体高开，科技股领涨',
            summary: '今日开盘，上证指数高开0.8%，深证成指高开1.2%，创业板指高开1.5%。科技股表现强势，半导体、人工智能板块涨幅居前。',
            source: '财经日报',
            url: '#',
            publish_time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4小时前
            category: '新闻',
            importance_level: 3,
            created_at: new Date().toISOString()
          },
          {
            id: 3,
            title: '新能源汽车销量创新高，产业链公司受益',
            summary: '据中汽协数据，2024年1月新能源汽车销量达到72.9万辆，同比增长78.8%，创历史新高。产业链上下游公司有望持续受益。',
            source: '行业研报',
            url: '#',
            publish_time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6小时前
            category: '研报',
            importance_level: 4,
            created_at: new Date().toISOString()
          },
          {
            id: 4,
            title: '美联储暗示年内可能降息，全球股市普涨',
            summary: '美联储主席鲍威尔在最新讲话中暗示，如果通胀持续回落，年内可能考虑降息。受此消息影响，全球主要股指普遍上涨。',
            source: '国际财经',
            url: '#',
            publish_time: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8小时前
            category: '新闻',
            importance_level: 4,
            created_at: new Date().toISOString()
          },
          {
            id: 5,
            title: '房地产政策再度松绑，地产股集体拉升',
            summary: '多个一线城市宣布进一步优化房地产调控政策，包括降低首付比例、放宽购房条件等。地产股午后集体拉升，板块涨幅超过5%。',
            source: '地产周刊',
            url: '#',
            publish_time: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), // 10小时前
            category: '新闻',
            importance_level: 3,
            created_at: new Date().toISOString()
          }
        ]

        // 根据类别过滤模拟数据
        const filteredMockNews = category 
          ? mockNews.filter(item => item.category === category)
          : mockNews

        return NextResponse.json({
          success: true,
          data: filteredMockNews.slice(0, limit),
          meta: {
            total: filteredMockNews.length,
            isTestData: true,
            message: '当前显示模拟新闻数据'
          }
        })
      }

      return NextResponse.json(
        { error: '获取新闻数据失败', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: news,
      meta: {
        total: news?.length || 0,
        isTestData: false
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
