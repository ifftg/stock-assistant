"use client"

export const dynamic = 'force-dynamic'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getSupabaseBrowser } from "@/lib/supabase"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const supabase = getSupabaseBrowser()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (err: any) {
      setError(err?.message || "登录失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* 粒子流背景 */}
      <div className="particle-background"></div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md glass-card p-8">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            登录智能股票分析平台
          </h1>
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-300 text-sm mb-2 font-medium">邮箱地址</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                placeholder="请输入您的邮箱"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-2 font-medium">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                placeholder="请输入您的密码"
                required
              />
            </div>
            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? "登录中..." : "登录"}
            </button>
          </form>
          <div className="text-center mt-6 text-gray-300 text-sm">
            还没有账号？
            <Link href="/signup" className="text-primary hover:text-primary/80 hover:underline ml-1 font-medium">
              立即注册
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
