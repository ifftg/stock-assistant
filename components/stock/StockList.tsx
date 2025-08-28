'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, RefreshCw, Heart, HeartOff } from 'lucide-react'
import { getMultipleStockInfo, formatPrice, formatChange, formatVolume, type StockInfo } from '@/lib/stock-api'

interface StockListProps {
  symbols: string[]
  title?: string
  showWatchlistControls?: boolean
  onAddToWatchlist?: (symbol: string) => void
  onRemoveFromWatchlist?: (symbol: string) => void
  watchlistSymbols?: string[]
  className?: string
}

export default function StockList({
  symbols,
  title = "股票列表",
  showWatchlistControls = false,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  watchlistSymbols = [],
  className = ""
}: StockListProps) {
  const [stocks, setStocks] = useState<StockInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  // 获取股票数据
  const fetchStocks = async () => {
    if (symbols.length === 0) {
      setStocks([])
      setLoading(false)
      return
    }

    try {
      setError('')
      const stockData = await getMultipleStockInfo(symbols)
      setStocks(stockData)
    } catch (err) {
      setError('获取股票数据失败')
      console.error('获取股票数据失败:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // 初始加载
  useEffect(() => {
    fetchStocks()
  }, [symbols])

  // 刷新数据
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchStocks()
  }

  // 自动刷新（每30秒）
  useEffect(() => {
    const interval = setInterval(() => {
      if (!refreshing && symbols.length > 0) {
        fetchStocks()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [symbols, refreshing])

  // 处理自选股操作
  const handleWatchlistToggle = (symbol: string) => {
    if (watchlistSymbols.includes(symbol)) {
      onRemoveFromWatchlist?.(symbol)
    } else {
      onAddToWatchlist?.(symbol)
    }
  }

  if (loading) {
    return (
      <div className={`bg-dark-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                <div className="flex-1">
                  <div className="h-4 bg-gray-600 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-600 rounded w-16"></div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-600 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-gray-600 rounded w-12"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-dark-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 ${className}`}>
        <div className="text-center">
          <div className="text-red-400 mb-4">{error}</div>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-dark-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 ${className}`}>
      {/* 标题和刷新按钮 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm">刷新</span>
        </button>
      </div>

      {/* 股票列表 */}
      {stocks.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          暂无股票数据
        </div>
      ) : (
        <div className="space-y-3">
          {stocks.map((stock) => (
            <div
              key={stock.symbol}
              className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg hover:bg-dark-700 transition-colors"
            >
              {/* 股票信息 */}
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div>
                    <h3 className="font-medium text-white">
                      {stock.symbol}
                    </h3>
                    <p className="text-sm text-gray-400">{stock.name}</p>
                  </div>
                  {showWatchlistControls && (
                    <button
                      onClick={() => handleWatchlistToggle(stock.symbol)}
                      className={`p-1 rounded transition-colors ${
                        watchlistSymbols.includes(stock.symbol)
                          ? 'text-red-400 hover:text-red-300'
                          : 'text-gray-400 hover:text-red-400'
                      }`}
                    >
                      {watchlistSymbols.includes(stock.symbol) ? (
                        <Heart className="h-4 w-4 fill-current" />
                      ) : (
                        <HeartOff className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* 价格信息 */}
              <div className="text-right">
                <div className="text-lg font-semibold text-white">
                  ¥{formatPrice(stock.price)}
                </div>
                <div className={`flex items-center text-sm ${
                  stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stock.change >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {formatChange(stock.change, stock.changePercent)}
                </div>
              </div>

              {/* 成交量 */}
              <div className="text-right ml-6 hidden md:block">
                <div className="text-sm text-gray-400">成交量</div>
                <div className="text-sm text-white">
                  {formatVolume(stock.volume)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 最后更新时间 */}
      {stocks.length > 0 && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          最后更新: {new Date(stocks[0].lastUpdate).toLocaleString()}
        </div>
      )}
    </div>
  )
}
