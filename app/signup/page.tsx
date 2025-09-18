'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { signUp } = useAuth()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('密码不匹配')
      return
    }

    if (password.length < 6) {
      setError('密码至少需要6个字符')
      return
    }

    try {
      setLoading(true)
      setError('')
      await signUp(email, password)
      router.push('/')
    } catch (err: any) {
      setError(err?.message || "注册失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative">
      <div className="particle-background"></div>
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md glass-card p-8">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            注册智能股票分析平台
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
                placeholder="请输入密码（至少6个字符）"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-2 font-medium">确认密码</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                placeholder="请再次输入密码"
                required
              />
            </div>
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-primary/90 hover:to-purple-600/90 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '注册中...' : '注册账户'}
            </button>
          </form>
          <div className="mt-8 text-center">
            <p className="text-gray-400">
              已有账户？{' '}
              <Link href="/login" className="text-primary hover:text-primary/80 transition-colors">
                立即登录
              </Link>
            </p>
          </div>
          <div className="mt-6 text-center">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
              ← 返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
