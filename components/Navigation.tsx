'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

const navigationItems = [
  {
    id: 'market',
    name: '市场行情',
    href: '/',
    description: '实时行情数据'
  },
  {
    id: 'strategies',
    name: '策略选股',
    href: '/strategies',
    description: '智能选股策略'
  },
  {
    id: 'analysis',
    name: 'AI分析',
    href: '/analysis',
    description: '智能股票分析'
  }
]

export default function Navigation() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, loading, signOut } = useAuth()

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="relative w-full">
      {/* 右上角登录/注册按钮 - 固定在导航栏右侧 */}
      <div className="absolute top-0 right-0 z-[60] flex items-center space-x-3">
        {loading ? (
          <div className="animate-pulse bg-white/10 rounded-xl px-4 py-2 w-20 h-10"></div>
        ) : user ? (
          <div className="flex items-center space-x-3">
            <span className="text-white text-sm hidden md:inline">欢迎，{user.email}</span>
            <button
              onClick={signOut}
              className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition-all duration-200"
            >
              退出
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
            >
              登录
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 rounded-xl bg-primary border border-primary/30 text-white hover:bg-primary/80 transition-all duration-200"
            >
              注册
            </Link>
          </div>
        )}
      </div>

      {/* 主导航栏 */}
      <nav className="glass-card border-0 border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-white hidden sm:inline">智能股票分析</span>
            </Link>

            {/* 桌面端导航菜单 */}
            <div className="hidden md:flex items-center space-x-1 mr-32">
              {navigationItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-primary text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* 移动端菜单按钮 */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* 移动端下拉菜单 */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10">
              <div className="space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-primary text-white'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm opacity-70">{item.description}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  )
}
