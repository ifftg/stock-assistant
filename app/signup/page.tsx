"use client"


export const dynamic = 'force-dynamic'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getSupabaseBrowser } from "@/lib/supabase"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setInfo(null)

    // 验证密码
    if (password.length < 6) {
      setError("密码长度至少6位")
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致")
      setLoading(false)
      return
    }

    try {
      const supabase = getSupabaseBrowser()
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setInfo("注册成功，请前往邮箱查收验证邮件（如已开启）")
        router.push("/login")
      }
    } catch (err: any) {
      setError(err?.message || "注册失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">注册</h1>
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
            <label className="block text-gray-300 text-sm mb-2">密码（至少6位）</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:border-blue-400"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-2">确认密码</label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          {error && <div className="text-sm text-red-400">{error}</div>}
          {info && <div className="text-sm text-green-400">{info}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-xl px-4 py-3 transition"
          >
            {loading ? "注册中..." : "注册"}
          </button>
        </form>
        <div className="text-center mt-4 text-gray-300 text-sm">
          已有账号？<Link href="/login" className="text-blue-400 hover:underline ml-1">去登录</Link>
        </div>
      </div>
    </div>
  )
}

