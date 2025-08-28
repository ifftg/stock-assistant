'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, Target, TrendingUp, BarChart3, Zap, RotateCcw } from 'lucide-react'
import StrategyCard from '@/components/screening/StrategyCard'
import StockDetail from '@/components/stock/StockDetail'
import { type ScreeningResult } from '@/lib/screening-api'

export default function ScreeningPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [selectedStock, setSelectedStock] = useState<ScreeningResult | null>(null)
  const [showStockDetail, setShowStockDetail] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleStockSelect = (stock: ScreeningResult) => {
    setSelectedStock(stock)
    setShowStockDetail(true)
  }

  return (
    <div className="min-h-screen">
      {/* 顶部导航栏 */}
      <nav className="bg-dark-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>返回仪表盘</span>
              </button>
              <div className="h-6 w-px bg-gray-600"></div>
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-400" />
                <h1 className="text-xl font-bold text-white">策略选股</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">
                欢迎，{user.user_metadata?.full_name || user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showStockDetail && selectedStock ? (
          <StockDetail
            symbol={selectedStock.symbol}
            onClose={() => setShowStockDetail(false)}
            className="mb-8"
          />
        ) : (
          <div className="space-y-8">
            {/* 页面介绍 */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <Target className="h-8 w-8 text-blue-400" />
                <div>
                  <h2 className="text-2xl font-bold text-white">智能策略选股</h2>
                  <p className="text-gray-300">基于量化分析的四大投资策略，为您筛选优质投资标的</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2 text-sm">
                  <BarChart3 className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-300">价值投资</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300">成长股</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Zap className="h-4 w-4 text-red-400" />
                  <span className="text-gray-300">动量策略</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <RotateCcw className="h-4 w-4 text-purple-400" />
                  <span className="text-gray-300">逆向投资</span>
                </div>
              </div>
            </div>

            {/* 策略卡片网格 */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <StrategyCard
                strategy="value_investing"
                onStockSelect={handleStockSelect}
              />
              
              <StrategyCard
                strategy="growth"
                onStockSelect={handleStockSelect}
              />
              
              <StrategyCard
                strategy="momentum"
                onStockSelect={handleStockSelect}
              />
              
              <StrategyCard
                strategy="contrarian"
                onStockSelect={handleStockSelect}
              />
            </div>

            {/* 使用说明 */}
            <div className="bg-dark-800/30 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">使用说明</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
                <div>
                  <h4 className="font-medium text-blue-400 mb-2">策略说明</h4>
                  <ul className="space-y-1">
                    <li>• <strong>价值投资</strong>：寻找低PE、低PB的被低估股票</li>
                    <li>• <strong>成长股</strong>：挖掘高增长潜力的优质企业</li>
                    <li>• <strong>动量策略</strong>：捕捉强势上涨的热门股票</li>
                    <li>• <strong>逆向投资</strong>：发现超跌反弹的投资机会</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-green-400 mb-2">操作指南</h4>
                  <ul className="space-y-1">
                    <li>• 点击"开始选股"按钮执行策略筛选</li>
                    <li>• 系统将实时分析全市场股票数据</li>
                    <li>• 结果按策略评分从高到低排序</li>
                    <li>• 点击股票可查看详细信息和技术指标</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  <strong>风险提示：</strong>策略选股结果仅供参考，不构成投资建议。投资有风险，入市需谨慎。
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
