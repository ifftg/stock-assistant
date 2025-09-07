// 自选股 API 完整测试脚本
// 需要先获取 Supabase access_token

const BASE_URL = process.env.VERCEL_URL || 'http://localhost:3000'

// 从环境变量或手动设置 access_token
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || 'YOUR_ACCESS_TOKEN_HERE'

async function testWatchlistsAPI() {
  console.log('🔐 自选股 API 测试（需要认证）\n')
  
  if (ACCESS_TOKEN === 'YOUR_ACCESS_TOKEN_HERE') {
    console.log('❌ 请先设置 SUPABASE_ACCESS_TOKEN 环境变量或修改脚本中的 ACCESS_TOKEN')
    console.log('💡 获取方法：')
    console.log('1. 在前端登录后从 session.access_token 获取')
    console.log('2. 或使用 Supabase CLI: supabase auth login')
    console.log('3. 或通过 REST API 登录获取')
    return
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ACCESS_TOKEN}`
  }

  // 1. 获取当前自选股（应该为空或有数据）
  console.log('📋 1. 获取自选股列表')
  try {
    const response = await fetch(`${BASE_URL}/api/watchlists`, { headers })
    const data = await response.json()
    console.log(`状态: ${response.status}`)
    console.log('响应:', JSON.stringify(data, null, 2))
  } catch (error) {
    console.log('错误:', error.message)
  }

  // 2. 添加自选股
  console.log('\n➕ 2. 添加自选股 000001')
  try {
    const response = await fetch(`${BASE_URL}/api/watchlists`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ticker: '000001',
        notes: '平安银行 - 测试添加'
      })
    })
    const data = await response.json()
    console.log(`状态: ${response.status}`)
    console.log('响应:', JSON.stringify(data, null, 2))
  } catch (error) {
    console.log('错误:', error.message)
  }

  // 3. 再次获取自选股（应该包含刚添加的）
  console.log('\n📋 3. 再次获取自选股列表')
  try {
    const response = await fetch(`${BASE_URL}/api/watchlists`, { headers })
    const data = await response.json()
    console.log(`状态: ${response.status}`)
    console.log('响应:', JSON.stringify(data, null, 2))
  } catch (error) {
    console.log('错误:', error.message)
  }

  // 4. 更新自选股备注
  console.log('\n✏️ 4. 更新自选股备注')
  try {
    const response = await fetch(`${BASE_URL}/api/watchlists`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ticker: '000001',
        notes: '平安银行 - 更新后的备注'
      })
    })
    const data = await response.json()
    console.log(`状态: ${response.status}`)
    console.log('响应:', JSON.stringify(data, null, 2))
  } catch (error) {
    console.log('错误:', error.message)
  }

  // 5. 删除自选股
  console.log('\n🗑️ 5. 删除自选股 000001')
  try {
    const response = await fetch(`${BASE_URL}/api/watchlists?ticker=000001`, {
      method: 'DELETE',
      headers
    })
    const data = await response.json()
    console.log(`状态: ${response.status}`)
    console.log('响应:', JSON.stringify(data, null, 2))
  } catch (error) {
    console.log('错误:', error.message)
  }

  // 6. 最终检查（应该为空）
  console.log('\n📋 6. 最终检查自选股列表')
  try {
    const response = await fetch(`${BASE_URL}/api/watchlists`, { headers })
    const data = await response.json()
    console.log(`状态: ${response.status}`)
    console.log('响应:', JSON.stringify(data, null, 2))
  } catch (error) {
    console.log('错误:', error.message)
  }

  console.log('\n✅ 自选股 API 测试完成！')
}

// 获取 access_token 的辅助函数
async function getAccessToken() {
  console.log('🔑 如何获取 access_token:')
  console.log('\n方法1: 前端登录后获取')
  console.log(`
import { supabase } from './lib/supabase'

const { data, error } = await supabase.auth.signInWithPassword({
  email: 'your-email@example.com',
  password: 'your-password'
})

if (data.session) {
  console.log('Access Token:', data.session.access_token)
}
`)

  console.log('\n方法2: 直接 REST API 登录')
  console.log(`
curl -X POST '${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password' \\
  -H "apikey: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
`)
}

if (require.main === module) {
  if (process.argv.includes('--help')) {
    getAccessToken()
  } else {
    testWatchlistsAPI().catch(console.error)
  }
}

module.exports = { testWatchlistsAPI, getAccessToken }
