'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

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
    name: '个股AI分析',
    href: '/analysis',
    description: 'AI智能分析'
  },
  {
    id: 'quant',
    name: '量化工作台',
    href: '/quant',
    description: '专业回测平台'
  },
  {
    id: 'trading',
    name: '交易系统',
    href: '/trading',
    description: '未开放',
    disabled: true
  }
]

export default function Navigation() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* 桌面端五板块大导航 - 整行占满，超大按钮 */}
      <nav className="hidden md:block w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-5 gap-4 bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10">
          {navigationItems.map((item) => (
            <Link
              key={item.id}
              href={item.disabled ? '#' : item.href}
              className={`
                relative group block text-center p-8 rounded-2xl font-bold text-lg transition-all duration-300 transform
                ${item.disabled
                  ? 'text-gray-500 cursor-not-allowed opacity-50 bg-gray-800/20'
                  : isActive(item.href)
                    ? 'bg-gradient-to-br from-blue-500 via-purple-600 to-blue-700 text-white shadow-2xl shadow-blue-500/30 scale-105 glow-border'
                    : 'text-gray-300 hover:text-white hover:bg-white/10 hover:scale-102 hover:shadow-lg hover:shadow-blue-500/20'
                }
              `}
              onClick={(e) => item.disabled && e.preventDefault()}
            >
              <div className="space-y-3">
                <div className="text-2xl font-bold">{item.name}</div>
                <div className="text-sm opacity-80 font-normal">{item.description}</div>
              </div>

              {/* 激活状态发光效果 */}
              {isActive(item.href) && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/20 to-purple-600/20 blur-xl -z-10"></div>
              )}

              {/* 悬停提示 */}
              {!isActive(item.href) && !item.disabled && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 px-4 py-2 bg-black/90 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  {item.description}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
                </div>
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* 移动端导航按钮 */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <div className="w-6 h-6 flex flex-col justify-center space-y-1">
          <div className={`w-full h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : ''}`}></div>
          <div className={`w-full h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></div>
          <div className={`w-full h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}></div>
        </div>
      </button>

      {/* 移动端导航菜单 */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm">
          <div className="absolute top-20 left-4 right-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.disabled ? '#' : item.href}
                  className={`
                    block px-4 py-3 rounded-xl font-semibold transition-all duration-300
                    ${item.disabled 
                      ? 'text-gray-500 cursor-not-allowed opacity-50' 
                      : isActive(item.href)
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }
                  `}
                  onClick={(e) => {
                    if (item.disabled) {
                      e.preventDefault()
                    } else {
                      setIsMobileMenuOpen(false)
                    }
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div>
                      <div>{item.name}</div>
                      <div className="text-sm opacity-70">{item.description}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 底部移动端导航栏（备选方案） */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/20 px-2 py-2">
        <div className="flex justify-around">
          {navigationItems.map((item) => (
            <Link
              key={item.id}
              href={item.disabled ? '#' : item.href}
              className={`
                flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-300
                ${item.disabled 
                  ? 'text-gray-500 cursor-not-allowed opacity-50' 
                  : isActive(item.href)
                    ? 'text-blue-400'
                    : 'text-gray-400 hover:text-white'
                }
              `}
              onClick={(e) => item.disabled && e.preventDefault()}
            >
              <span className="text-xs">{item.name.replace('个股AI分析', 'AI分析').replace('量化工作台', '量化').replace('交易系统', '交易')}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
