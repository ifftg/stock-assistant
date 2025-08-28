'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import StockSearch from '@/components/stock/StockSearch'
import StockList from '@/components/stock/StockList'
import StockDetail from '@/components/stock/StockDetail'
import { type StockInfo } from '@/lib/stock-api'

export default function StocksPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [selectedStock, setSelectedStock] = useState<StockInfo | null>(null)
  const [showStockDetail, setShowStockDetail] = useState(false)
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>(['000001', '600036', '600519'])
  
  // 推荐股票列表
  const recommendedStocks = ['000001', '000002', '600000', '600036', '600519', '000858', '002415', '000725', '600276', '300059']

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

  // 处理股票选择
  const handleStockSelect = (stock: StockInfo) => {
    setSelectedStock(stock)
    setShowStockDetail(true)
  }

  // 添加到自选股
  const handleAddToWatchlist = (symbol: string) => {
    if (!watchlistSymbols.includes(symbol)) {
      setWatchlistSymbols([...watchlistSymbols, symbol])
    }
  }

  // 从自选股移除
  const handleRemoveFromWatchlist = (symbol: string) => {
    setWatchlistSymbols(watchlistSymbols.filter(s => s !== symbol))
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
              <h1 className="text-xl font-bold text-white">股票搜索</h1>
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
            {/* 搜索区域 */}
            <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-4">
                股票搜索
              </h2>
              <p className="text-gray-300 mb-6">
                搜索A股市场中的任意股票，获取实时价格和详细信息
              </p>
              
              <StockSearch
                onStockSelect={handleStockSelect}
                placeholder="输入股票代码（如：000001）或股票名称（如：平安银行）"
                className="max-w-2xl"
              />
            </div>

            {/* 股票列表 */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* 我的自选股 */}
              <StockList
                symbols={watchlistSymbols}
                title="我的自选股"
                showWatchlistControls={true}
                onAddToWatchlist={handleAddToWatchlist}
                onRemoveFromWatchlist={handleRemoveFromWatchlist}
                watchlistSymbols={watchlistSymbols}
              />

              {/* 推荐股票 */}
              <StockList
                symbols={recommendedStocks}
                title="推荐股票"
                showWatchlistControls={true}
                onAddToWatchlist={handleAddToWatchlist}
                onRemoveFromWatchlist={handleRemoveFromWatchlist}
                watchlistSymbols={watchlistSymbols}
              />
            </div>

            {/* 市场概览 */}
            <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">市场概览</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 mb-2">+1.25%</div>
                  <div className="text-gray-400">上证指数</div>
                  <div className="text-sm text-gray-500">3,245.67</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400 mb-2">-0.85%</div>
                  <div className="text-gray-400">深证成指</div>
                  <div className="text-sm text-gray-500">10,876.43</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 mb-2">+2.15%</div>
                  <div className="text-gray-400">创业板指</div>
                  <div className="text-sm text-gray-500">2,156.89</div>
                </div>
              </div>
            </div>

            {/* 使用提示 */}
            <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-400 mb-3">使用提示</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• 在搜索框中输入股票代码（如：000001）或股票名称（如：平安银行）</li>
                <li>• 点击搜索结果可查看股票详细信息</li>
                <li>• 点击❤️图标可将股票添加到自选股</li>
                <li>• 股票数据每30秒自动刷新一次</li>
                <li>• 支持上交所、深交所、创业板等所有A股市场</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
