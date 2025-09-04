// 市场指数API路由
// 文件路径: app/api/market-indices/route.ts

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// 强制动态渲染
export const dynamic = 'force-dynamic'

// 创建Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET /api/market-indices - 获取市场指数数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeTestData = searchParams.get('includeTestData') === 'true'

    // 构建查询
    let query = supabase
      .from('market_indices')
      .select('*')
      .order('update_time', { ascending: false })

    // 如果不包含测试数据，则过滤掉
    if (!includeTestData) {
      query = query.eq('is_test_data', false)
    }

    const { data: indices, error } = await query

    if (error) {
      console.error('获取市场指数失败:', error)
      return NextResponse.json(
        { error: '获取市场指数失败', details: error.message },
        { status: 500 }
      )
    }

    // 处理数据格式
    const processedIndices = indices?.map(index => ({
      code: index.index_code,
      name: index.index_name,
      price: parseFloat(index.current_price || 0),
      change: parseFloat(index.change_amount || 0),
      changePercent: parseFloat(index.change_percent || 0),
      volume: parseInt(index.volume || 0),
      turnover: parseFloat(index.turnover || 0),
      isTestData: index.is_test_data || false,
      dataSource: index.data_source || 'API',
      updateTime: index.update_time
    })) || []

    return NextResponse.json({
      success: true,
      data: processedIndices,
      meta: {
        total: processedIndices.length,
        hasTestData: processedIndices.some(index => index.isTestData),
        testDataCount: processedIndices.filter(index => index.isTestData).length,
        lastUpdate: processedIndices[0]?.updateTime || null
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

/*
API使用示例：

1. 获取所有指数（包含测试数据）：
   GET /api/market-indices?includeTestData=true

2. 获取生产数据（不包含测试数据）：
   GET /api/market-indices?includeTestData=false

3. 响应格式：
{
  "success": true,
  "data": [
    {
      "code": "sh000001",
      "name": "上证指数",
      "price": 3234.56,
      "change": 39.87,
      "changePercent": 1.25,
      "volume": 245600000000,
      "turnover": 345600000000,
      "isTestData": true,
      "dataSource": "TEST",
      "updateTime": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "total": 3,
    "hasTestData": true,
    "testDataCount": 3,
    "lastUpdate": "2024-01-15T10:30:00Z"
  }
}
*/
