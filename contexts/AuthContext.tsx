'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { getSupabaseBrowser, User, AuthState } from '@/lib/supabase'
import { Session } from '@supabase/supabase-js'

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 获取初始会话
    const getInitialSession = async () => {
      try {
        const supabase = getSupabaseBrowser()
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('获取会话失败:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // 监听认证状态变化
    try {
      const supabase = getSupabaseBrowser()
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setUser(session?.user ?? null)
          setLoading(false)
        }
      )

      return () => subscription.unsubscribe()
    } catch (error) {
      console.error('设置认证监听失败:', error)
      setLoading(false)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const supabase = getSupabaseBrowser()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error: any) {
      console.error('登录失败:', error)
      return { error }
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const supabase = getSupabaseBrowser()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })
      return { error }
    } catch (error: any) {
      console.error('注册失败:', error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      const supabase = getSupabaseBrowser()
      await supabase.auth.signOut()
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const supabase = getSupabaseBrowser()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      return { error }
    } catch (error: any) {
      console.error('重置密码失败:', error)
      return { error }
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
