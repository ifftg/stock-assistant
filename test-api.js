// API 测试脚本
// 使用方法: node test-api.js

const BASE_URL = process.env.VERCEL_URL || 'http://localhost:3000'

async function testAPI(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`
  console.log(`\n🔍 测试: ${options.method || 'GET'} ${endpoint}`)
  
  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    })
    
    const data = await response.json()
    console.log(`✅ 状态: ${response.status}`)
    console.log(`📊 响应:`, JSON.stringify(data, null, 2))
    return { success: response.ok, data, status: response.status }
  } catch (error) {
    console.log(`❌ 错误:`, error.message)
    return { success: false, error: error.message }
  }
}

async function runTests() {
  console.log('🚀 开始 API 测试...\n')
  
  // 1. 测试股票列表 API
  await testAPI('/api/stocks?includeTestData=true&limit=3')
  
  // 2. 测试市场指数 API  
  await testAPI('/api/market-indices?includeTestData=true')
  
  // 3. 测试策略筛选 API
  await testAPI('/api/strategies/screen?strategy=value_strategy')
  
  // 4. 测试自选股 API（无认证，应该返回 401）
  await testAPI('/api/watchlists')
  
  // 5. 测试不存在的策略
  await testAPI('/api/strategies/screen?strategy=nonexistent')
  
  console.log('\n🎯 测试完成！')
  console.log('\n📝 说明:')
  console.log('- 前3个API应该返回200状态码和数据')
  console.log('- 自选股API应该返回401（未认证）')
  console.log('- 不存在的策略应该返回400（参数错误）')
}

// 如果直接运行此脚本
if (require.main === module) {
  runTests().catch(console.error)
}

module.exports = { testAPI, runTests }
