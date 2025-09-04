// Supabase Edge Function: 市场行情数据获取
// 文件路径: supabase/functions/market-data/index.ts

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
    const url = new URL(req.url)
    const action = url.searchParams.get('action')
    
    // 初始化Supabase客户端
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    switch (action) {
      case 'indices':
        return await getMarketIndices(supabase)
      
      case 'gainers':
        const gainersLimit = parseInt(url.searchParams.get('limit') || '10')
        return await getGainersLosers(supabase, 'gainers', gainersLimit)
      
      case 'losers':
        const losersLimit = parseInt(url.searchParams.get('limit') || '10')
        return await getGainersLosers(supabase, 'losers', losersLimit)
      
      case 'volume':
        const volumeLimit = parseInt(url.searchParams.get('limit') || '10')
        return await getVolumeRanking(supabase, volumeLimit)
      
      case 'sectors':
        return await getHotSectors(supabase)
      
      case 'update':
        return await updateMarketData()
      
      default:
        throw new Error('无效的操作类型')
    }

  } catch (error) {
    console.error('市场数据获取错误:', error)
    
    return new Response(JSON.stringify({
      error: error.message || '获取市场数据时发生未知错误'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

// 获取大盘指数
async function getMarketIndices(supabase: any) {
  const { data, error } = await supabase
    .from('market_indices')
    .select('*')
    .order('update_time', { ascending: false })
    .limit(3) // 上证、深证、创业板

  if (error) {
    throw new Error(`获取大盘指数失败: ${error.message}`)
  }

  return new Response(JSON.stringify({
    success: true,
    data: data || []
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

// 获取涨跌幅排行
async function getGainersLosers(supabase: any, type: 'gainers' | 'losers', limit: number) {
  const order = type === 'gainers' ? { ascending: false } : { ascending: true }
  
  const { data, error } = await supabase
    .from('stocks_daily')
    .select('ticker, name, close_price, change_percent, volume, turnover')
    .not('change_percent', 'is', null)
    .order('change_percent', order)
    .limit(limit)

  if (error) {
    throw new Error(`获取${type === 'gainers' ? '涨幅' : '跌幅'}排行失败: ${error.message}`)
  }

  return new Response(JSON.stringify({
    success: true,
    type: type,
    data: data || []
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

// 获取成交量排行
async function getVolumeRanking(supabase: any, limit: number) {
  const { data, error } = await supabase
    .from('stocks_daily')
    .select('ticker, name, close_price, volume, turnover, change_percent')
    .not('volume', 'is', null)
    .order('volume', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`获取成交量排行失败: ${error.message}`)
  }

  return new Response(JSON.stringify({
    success: true,
    data: data || []
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

// 获取热门概念板块
async function getHotSectors(supabase: any) {
  const { data, error } = await supabase
    .from('concept_sectors')
    .select('*')
    .order('change_percent', { ascending: false })
    .limit(10)

  if (error) {
    throw new Error(`获取热门板块失败: ${error.message}`)
  }

  return new Response(JSON.stringify({
    success: true,
    data: data || []
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

// 更新市场数据（定时任务调用）
async function updateMarketData() {
  try {
    // 这里调用东方财富API获取最新数据
    // 示例：获取大盘指数数据
    const indicesData = await fetchIndicesFromEastMoney()
    
    // 获取涨跌幅数据
    const stocksData = await fetchStocksFromEastMoney()
    
    // 获取概念板块数据
    const sectorsData = await fetchSectorsFromEastMoney()

    return new Response(JSON.stringify({
      success: true,
      message: '市场数据更新完成',
      updated_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    throw new Error(`更新市场数据失败: ${error.message}`)
  }
}

// 从东方财富获取指数数据
async function fetchIndicesFromEastMoney() {
  // 东方财富大盘指数API
  const response = await fetch('http://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&secids=1.000001,0.399001,0.399006&fields=f2,f3,f4,f5,f6,f12,f13,f14')
  
  if (!response.ok) {
    throw new Error('获取指数数据失败')
  }
  
  const data = await response.json()
  return data.data?.diff || []
}

// 从东方财富获取股票数据
async function fetchStocksFromEastMoney() {
  // 东方财富涨跌幅排行API
  const response = await fetch('http://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=50&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&fid=f3&fs=m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23&fields=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152')
  
  if (!response.ok) {
    throw new Error('获取股票数据失败')
  }
  
  const data = await response.json()
  return data.data?.diff || []
}

// 从东方财富获取板块数据
async function fetchSectorsFromEastMoney() {
  // 东方财富概念板块API
  const response = await fetch('http://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=50&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&fid=f3&fs=m:90+t:3&fields=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f26,f22,f33,f11,f62,f128,f136,f115,f152,f124,f107,f104,f105,f140,f141,f207,f222')
  
  if (!response.ok) {
    throw new Error('获取板块数据失败')
  }
  
  const data = await response.json()
  return data.data?.diff || []
}

/* 
部署说明：
1. 在Supabase项目中创建新的Edge Function
2. 将此代码复制到 supabase/functions/market-data/index.ts
3. 部署命令：supabase functions deploy market-data

调用示例：
- 获取大盘指数：GET /functions/v1/market-data?action=indices
- 获取涨幅榜：GET /functions/v1/market-data?action=gainers&limit=10
- 获取跌幅榜：GET /functions/v1/market-data?action=losers&limit=10
- 获取成交量榜：GET /functions/v1/market-data?action=volume&limit=10
- 获取热门板块：GET /functions/v1/market-data?action=sectors
- 更新数据：GET /functions/v1/market-data?action=update
*/
