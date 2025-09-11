// 批量获取股票历史数据脚本
const SUPABASE_URL = 'https://wvkrfaznogbruocaxfja.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2a3JmYXpub2dicnVvY2F4ZmphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMjA5OTYsImV4cCI6MjA3MTc5Njk5Nn0.l2wZvz69a0TsGisqSQ19028hfL_ySk2-hJNmFrjRBzQ'

// 获取所有股票代码
async function getAllStockTickers() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/stocks_info?select=ticker&order=ticker`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  })
  
  if (!response.ok) {
    throw new Error(`获取股票列表失败: ${response.status}`)
  }
  
  const data = await response.json()
  return data.map(item => item.ticker)
}

// 批量获取历史数据
async function batchFetchHistoryData(tickers, days = 30) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/stock-data-fetcher`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'fetch_history_batch',
      tickers: tickers,
      days: days
    })
  })
  
  if (!response.ok) {
    throw new Error(`批量获取失败: ${response.status}`)
  }
  
  return await response.json()
}

// 主函数
async function main() {
  try {
    console.log('🚀 开始批量获取股票历史数据...')
    
    // 获取所有股票代码
    console.log('📋 获取股票列表...')
    const allTickers = await getAllStockTickers()
    console.log(`📊 共找到 ${allTickers.length} 只股票`)
    
    // 分批处理，每批50只股票
    const batchSize = 50
    const totalBatches = Math.ceil(allTickers.length / batchSize)
    let totalRecords = 0
    let totalErrors = 0
    
    for (let i = 0; i < totalBatches; i++) {
      const start = i * batchSize
      const end = Math.min(start + batchSize, allTickers.length)
      const batch = allTickers.slice(start, end)
      
      console.log(`\n🔄 处理第 ${i + 1}/${totalBatches} 批 (${batch.length} 只股票)`)
      console.log(`📈 股票代码: ${batch.slice(0, 5).join(', ')}${batch.length > 5 ? '...' : ''}`)
      
      try {
        const result = await batchFetchHistoryData(batch, 30)
        
        if (result.success) {
          totalRecords += result.records_updated
          const errorCount = Object.keys(result.errors || {}).length
          totalErrors += errorCount
          
          console.log(`✅ 批次完成: 获取 ${result.records_updated} 条记录`)
          if (errorCount > 0) {
            console.log(`⚠️  错误数量: ${errorCount}`)
            console.log(`❌ 错误详情:`, result.errors)
          }
        } else {
          console.log(`❌ 批次失败:`, result.error)
          totalErrors += batch.length
        }
      } catch (error) {
        console.log(`❌ 批次异常:`, error.message)
        totalErrors += batch.length
      }
      
      // 避免请求过于频繁，每批之间暂停2秒
      if (i < totalBatches - 1) {
        console.log('⏳ 等待 2 秒...')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
    
    console.log('\n🎉 批量获取完成!')
    console.log(`📊 总计处理: ${allTickers.length} 只股票`)
    console.log(`📈 成功获取: ${totalRecords} 条历史记录`)
    console.log(`❌ 错误数量: ${totalErrors}`)
    console.log(`✅ 成功率: ${((allTickers.length - totalErrors) / allTickers.length * 100).toFixed(1)}%`)
    
  } catch (error) {
    console.error('💥 脚本执行失败:', error)
  }
}

// 运行脚本
main()
