'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import StockSearch from '@/components/stock/StockSearch'
import StockList from '@/components/stock/StockList'
import StockDetail from '@/components/stock/StockDetail'
import { type StockInfo, getPopularStocks } from '@/lib/stock-api'

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [selectedStock, setSelectedStock] = useState<StockInfo | null>(null)
  const [showStockDetail, setShowStockDetail] = useState(false)
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>(['000001', '600036', '600519'])
  const [popularStocks, setPopularStocks] = useState<string[]>([])

  // 加载热门股票
  useEffect(() => {
    const loadPopularStocks = async () => {
      const popular = await getPopularStocks()
      setPopularStocks(popular)
    }
    loadPopularStocks()
  }, [])

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

  const handleStockSelect = (stock: StockInfo) => {
    setSelectedStock(stock)
    setShowStockDetail(true)
  }

  const handleAddToWatchlist = (symbol: string) => {
    if (!watchlistSymbols.includes(symbol)) {
      setWatchlistSymbols([...watchlistSymbols, symbol])
    }
  }

  const handleRemoveFromWatchlist = (symbol: string) => {
    setWatchlistSymbols(watchlistSymbols.filter(s => s !== symbol))
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-dark-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">智能股票分析平台</h1>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showStockDetail && selectedStock ? (
          <StockDetail
            symbol={selectedStock.symbol}
            onClose={() => setShowStockDetail(false)}
            className="mb-8"
          />
        ) : (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="mb-4 lg:mb-0">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    欢迎来到智能股票分析平台！
                  </h2>
                  <p className="text-gray-300">
                    开始您的智能投资之旅，获取专业的股票分析和投资建议。
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/dashboard/stocks"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors text-center"
                  >
                    股票搜索
                  </Link>
                  <Link
                    href="/dashboard/screening"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors text-center"
                  >
                    策略选股
                  </Link>
                </div>
              </div>
              
              <div className="mt-6">
                <StockSearch
                  onStockSelect={handleStockSelect}
                  placeholder="快速搜索股票代码或名称..."
                  className="max-w-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <StockList
                symbols={watchlistSymbols}
                title="我的自选股"
                showWatchlistControls={true}
                onAddToWatchlist={handleAddToWatchlist}
                onRemoveFromWatchlist={handleRemoveFromWatchlist}
                watchlistSymbols={watchlistSymbols}
              />

              <StockList
                symbols={popularStocks}
                title="热门股票"
                showWatchlistControls={true}
                onAddToWatchlist={handleAddToWatchlist}
                onRemoveFromWatchlist={handleRemoveFromWatchlist}
                watchlistSymbols={watchlistSymbols}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">{watchlistSymbols.length}</div>
                <div className="text-gray-400">自选股票</div>
              </div>
              <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">0</div>
                <div className="text-gray-400">分析报告</div>
              </div>
              <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">0</div>
                <div className="text-gray-400">投资建议</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
