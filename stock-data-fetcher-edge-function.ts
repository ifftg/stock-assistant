// Supabase Edge Function: 股票数据获取器
// 从东方财富API获取股票数据并存储到Supabase数据库
// 复制此代码到Supabase Dashboard的stock-data-fetcher函数中

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 东方财富API配置
const EASTMONEY_CONFIG = {
  BASE_URL: 'http://push2.eastmoney.com/api/qt',
  STOCK_LIST: '/clist/get',
  KLINE_URL: 'http://push2his.eastmoney.com/api/qt/stock/kline/get',
  
  // 通用参数
  COMMON_PARAMS: {
    cb: 'jQuery',
    pn: 1,
    pz: 100, // 每次获取100只股票
    po: 1,
    np: 1,
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: 2,
    invt: 2,
    fid: 'f3',
    fs: 'm:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23', // A股筛选
    fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152'
  }
}

// 构建东方财富API URL
function buildEastmoneyUrl(endpoint: string, params: Record<string, any> = {}): string {
  const allParams = { ...EASTMONEY_CONFIG.COMMON_PARAMS, ...params }
  const queryString = Object.entries(allParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&')
  
  return `${EASTMONEY_CONFIG.BASE_URL}${endpoint}?${queryString}`
}

// 解析东方财富JSONP响应
function parseEastmoneyResponse(response: string): any {
  try {
    let jsonStr = response.trim()
    
    // 移除JSONP包装
    if (jsonStr.startsWith('jQuery(')) {
      jsonStr = jsonStr.replace(/^jQuery\(/, '').replace(/\);?$/, '')
    } else if (jsonStr.match(/^jQuery\d+_\d+\(/)) {
      jsonStr = jsonStr.replace(/^jQuery\d+_\d+\(/, '').replace(/\);?$/, '')
    }
    
    // 移除可能的尾部分号
    jsonStr = jsonStr.replace(/;$/, '')
    
    return JSON.parse(jsonStr)
  } catch (error) {
    console.error('解析东方财富响应失败:', error)
    return null
  }
}

// 获取市场名称
function getMarketName(marketCode: string): string {
  const marketMap: Record<string, string> = {
    '0': '深圳',
    '1': '上海',
    '116': '美股',
    '117': '港股'
  }
  return marketMap[marketCode] || '未知'
}

// 从东方财富获取股票列表
async function fetchStockListFromEastmoney(pageSize: number = 100, pageNumber: number = 1): Promise<any[]> {
  try {
    const url = buildEastmoneyUrl(EASTMONEY_CONFIG.STOCK_LIST, { pz: pageSize, pn: pageNumber })
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://quote.eastmoney.com/',
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const text = await response.text()
    const data = parseEastmoneyResponse(text)
    
    if (!data || !data.data || !data.data.diff) {
      throw new Error('东方财富API返回数据格式错误')
    }
    
    // 处理股票数据
    const stocks = data.data.diff.map((item: any) => ({
      ticker: item.f12,                    // 股票代码
      name: item.f14,                      // 股票名称
      market: getMarketName(item.f13),     // 市场
      industry: '待更新',                   // 行业（需要从其他接口获取）
      close_price: item.f2 / 100,          // 最新价（分转元）
      open_price: item.f17 / 100,          // 开盘价
      high_price: item.f15 / 100,          // 最高价
      low_price: item.f16 / 100,           // 最低价
      prev_close: item.f18 / 100,          // 昨收价
      change_amount: item.f4 / 100,        // 涨跌额
      change_percent: item.f3,             // 涨跌幅
      volume: item.f5,                     // 成交量
      turnover: item.f6,                   // 成交额
      amplitude: item.f7,                  // 振幅
      turnover_rate: item.f8,              // 换手率
      pe_ratio: item.f9,                   // 市盈率动态
      pb_ratio: item.f23,                  // 市净率
      market_cap: item.f20,                // 总市值
      circulating_market_cap: item.f21,    // 流通市值
      total_shares: item.f20,              // 总股本
      circulating_shares: item.f21,        // 流通股本
      updated_at: new Date().toISOString() // 更新时间
    }))
    
    return stocks
    
  } catch (error) {
    console.error('获取东方财富股票列表失败:', error)
    throw error
  }
}

// 获取单只股票的K线数据
async function fetchStockKlineData(ticker: string, days: number = 30): Promise<any[]> {
  try {
    const marketCode = ticker.startsWith('6') ? '1' : '0' // 6开头是上海，其他是深圳
    const stockCode = `${marketCode}.${ticker}`
    
    const url = `${EASTMONEY_CONFIG.KLINE_URL}?cb=jQuery&secid=${stockCode}&ut=fa5fd1943c7b386f172d6893dbfba10b&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61&klt=101&fqt=1&end=20500101&lmt=${days}&iscca=1`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://quote.eastmoney.com/',
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const text = await response.text()
    const data = parseEastmoneyResponse(text)
    
    if (!data || !data.data || !data.data.klines) {
      return [] // 如果没有K线数据，返回空数组
    }
    
    // 解析K线数据
    const klines = data.data.klines.map((kline: string) => {
      const [date, open, close, high, low, volume, turnover, amplitude, changePercent, change, turnoverRate] = kline.split(',')
      
      return {
        ticker,
        trade_date: date,
        open_price: parseFloat(open),
        close_price: parseFloat(close),
        high_price: parseFloat(high),
        low_price: parseFloat(low),
        volume: parseInt(volume),
        turnover: parseFloat(turnover)
      }
    })
    
    return klines
    
  } catch (error) {
    console.error(`获取股票${ticker}的K线数据失败:`, error)
    return []
  }
}

serve(async (req) => {
  // 处理CORS预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 获取环境变量
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // 创建Supabase客户端
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 获取请求参数
    const { action, ticker, page_size = 100, page_number = 1, days = 30 } = await req.json()

    let result: any = {}

    switch (action) {
      case 'fetch_stock_list':
        // 获取股票列表并更新数据库
        console.log(`开始获取股票列表，页面大小: ${page_size}，页码: ${page_number}`)

        const stocks = await fetchStockListFromEastmoney(page_size, page_number)
        console.log(`从东方财富获取到 ${stocks.length} 只股票数据`)

        // 批量插入或更新股票基础信息（仅写入 stocks_info 表包含的列）
        const stockInfoRows = stocks.map((s: any) => ({
          ticker: s.ticker,
          name: s.name,
          market: s.market,
          industry: s.industry,
          data_source: 'API'
        }))
        const { data: stocksData, error: stocksError } = await supabase
          .from('stocks_info')
          .upsert(stockInfoRows, {
            onConflict: 'ticker',
            ignoreDuplicates: false
          })

        if (stocksError) {
          throw new Error(`更新股票信息失败: ${stocksError.message}`)
        }

        // 批量插入股票价格数据
        const priceData = stocks.map(stock => ({
          ticker: stock.ticker,
          trade_date: new Date().toISOString().split('T')[0], // 今天日期
          open_price: stock.open_price,
          close_price: stock.close_price,
          high_price: stock.high_price,
          low_price: stock.low_price,
          volume: stock.volume,
          turnover: stock.turnover,
          pe_ratio: stock.pe_ratio,
          pb_ratio: stock.pb_ratio,
          market_cap: stock.market_cap
        }))

        const { data: pricesData, error: pricesError } = await supabase
          .from('stocks_daily')
          .upsert(priceData, {
            onConflict: 'ticker,trade_date',
            ignoreDuplicates: false
          })

        if (pricesError) {
          throw new Error(`更新股票价格失败: ${pricesError.message}`)
        }

        result = {
          success: true,
          message: `成功更新 ${stocks.length} 只股票数据`,
          stocks_updated: stocks.length,
          timestamp: new Date().toISOString()
        }
        break

      case 'fetch_stock_history':
        // 获取指定股票的历史数据
        if (!ticker) {
          throw new Error('股票代码不能为空')
        }

        console.log(`开始获取股票 ${ticker} 的历史数据，天数: ${days}`)
        
        const klines = await fetchStockKlineData(ticker, days)
        console.log(`从东方财富获取到 ${klines.length} 条K线数据`)

        if (klines.length > 0) {
          const { data: klinesData, error: klinesError } = await supabase
            .from('stocks_daily')
            .upsert(klines, {
              onConflict: 'ticker,trade_date',
              ignoreDuplicates: false
            })

          if (klinesError) {
            throw new Error(`更新K线数据失败: ${klinesError.message}`)
          }
        }

        result = {
          success: true,
          message: `成功更新股票 ${ticker} 的 ${klines.length} 条历史数据`,
          ticker,
          records_updated: klines.length,
          timestamp: new Date().toISOString()
        }
        break

      default:
        throw new Error(`不支持的操作: ${action}`)
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('股票数据获取失败:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
