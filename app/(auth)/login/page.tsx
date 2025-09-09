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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">登录</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm mb-2">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-2">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400"
              placeholder="••••••••"
              required
            />
          </div>
          {error && (
            <div className="text-sm text-red-400">{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-xl px-4 py-3 transition"
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>
        <div className="text-center mt-4 text-gray-300 text-sm">
          还没有账号？<Link href="/signup" className="text-blue-400 hover:underline ml-1">注册</Link>
        </div>
      </div>
    </div>
  )
}

