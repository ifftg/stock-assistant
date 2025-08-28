import { createBrowserClient } from '@supabase/ssr'

// 客户端Supabase实例（用于客户端组件）
export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// 数据库类型定义
export type Database = {
  public: {
    Tables: {
      watchlists: {
        Row: {
          id: string
          user_id: string
          ticker: string
          stock_name: string | null
          added_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ticker: string
          stock_name?: string | null
          added_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          ticker?: string
          stock_name?: string | null
          added_at?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
