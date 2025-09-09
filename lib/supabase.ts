// Supabase客户端配置（延迟创建，避免构建期读取 env 导致 Vercel 预渲染报错）
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let browserClient: SupabaseClient | null = null

export function getSupabaseBrowser(): SupabaseClient {
  if (browserClient) return browserClient
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('Supabase env not set')
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
