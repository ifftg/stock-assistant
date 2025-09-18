// Supabase客户端配置（延迟创建，避免构建期读取 env 导致 Vercel 预渲染报错）
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let browserClient: SupabaseClient | null = null

export function getSupabaseBrowser(): SupabaseClient {
  if (browserClient) return browserClient
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  // 调试信息
  console.log('Supabase环境变量检查:', {
    url: url ? '已设置' : '未设置',
    key: key ? '已设置' : '未设置',
    urlValue: url,
    keyPrefix: key ? key.substring(0, 20) + '...' : '无'
  })

  if (!url || !key) {
    console.warn('Supabase环境变量未设置，使用默认配置')
    // 使用您的实际Supabase配置作为fallback
    const fallbackUrl = 'https://wvkrfaznogbruocaxfja.supabase.co'
    const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2a3JmYXpub2dicnVvY2F4ZmphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMjA5OTYsImV4cCI6MjA3MTc5Njk5Nn0.l2wZvz69a0TsGisqSQ19028hfL_ySk2-hJNmFrjRBzQ'
    browserClient = createClient(fallbackUrl, fallbackKey)
    return browserClient
  }
  browserClient = createClient(url, key)
  return browserClient
}

// 认证相关类型定义
export interface User {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
}

// 认证状态类型
export interface AuthState {
  user: User | null
  loading: boolean
}
