'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, TrendingUp, TrendingDown } from 'lucide-react'
import { searchStocks, getStockInfo, type StockSearchResult, type StockInfo } from '@/lib/stock-api'

interface StockSearchProps {
  onStockSelect?: (stock: StockInfo) => void
  placeholder?: string
  className?: string
}

export default function StockSearch({ 
  onStockSelect, 
  placeholder = "搜索股票代码或名称...",
  className = ""
}: StockSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<StockSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedStock, setSelectedStock] = useState<StockInfo | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  // 搜索股票
  useEffect(() => {
    const searchDebounced = setTimeout(async () => {
      if (query.trim()) {
        setLoading(true)
        try {
          const searchResults = await searchStocks(query)
          setResults(searchResults)
          setShowResults(true)
        } catch (error) {
          console.error('搜索失败:', error)
        } finally {
          setLoading(false)
        }
      } else {
        setResults([])
        setShowResults(false)
      }
    }, 300)

    return () => clearTimeout(searchDebounced)
  }, [query])

  // 点击外部关闭搜索结果
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 选择股票
  const handleStockSelect = async (stockResult: StockSearchResult) => {
    setQuery(`${stockResult.symbol} ${stockResult.name}`)
    setShowResults(false)
    setLoading(true)

    try {
      const stockInfo = await getStockInfo(stockResult.symbol)
      if (stockInfo) {
        setSelectedStock(stockInfo)
        onStockSelect?.(stockInfo)
      }
    } catch (error) {
      console.error('获取股票信息失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 清除搜索
  const handleClear = () => {
    setQuery('')
    setResults([])
    setShowResults(false)
    setSelectedStock(null)
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* 搜索输入框 */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setShowResults(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 bg-dark-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
          >
            ×
          </button>
        )}
      </div>

      {/* 搜索结果下拉框 */}
      {showResults && (
        <div className="absolute z-[9999] w-full mt-1 bg-dark-800 border border-gray-600 rounded-lg shadow-xl max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-400">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <span className="mt-2 block">搜索中...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="py-1">
              {results.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => handleStockSelect(stock)}
                  className="w-full px-4 py-3 text-left hover:bg-dark-700 transition-colors border-b border-gray-700/50 last:border-b-0 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-blue-400 font-medium">
                          {stock.symbol}
                        </span>
                        <span className="font-medium text-white">
                          {stock.name}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {stock.market} · {stock.type}
                      </div>
                    </div>
                    <div className="text-gray-400 group-hover:text-blue-400 transition-colors">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="p-4 text-center text-gray-400">
              <div className="text-gray-500 mb-2">未找到相关股票</div>
              <div className="text-sm text-gray-600">
                请尝试输入完整的股票代码或名称
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* 选中的股票信息 */}
      {selectedStock && (
        <div className="mt-4 p-4 bg-dark-800/50 backdrop-blur-sm rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {selectedStock.symbol} {selectedStock.name}
              </h3>
              <p className="text-sm text-gray-400">
                最后更新: {new Date(selectedStock.lastUpdate).toLocaleTimeString()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                ¥{selectedStock.price.toFixed(2)}
              </div>
              <div className={`flex items-center text-sm ${
                selectedStock.change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {selectedStock.change >= 0 ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)} 
                ({selectedStock.change >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%)
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-400">成交量</span>
              <div className="text-white font-medium">
                {(selectedStock.volume / 10000).toFixed(0)}万
              </div>
            </div>
            {selectedStock.pe && (
              <div>
                <span className="text-gray-400">市盈率</span>
                <div className="text-white font-medium">{selectedStock.pe}</div>
              </div>
            )}
            {selectedStock.pb && (
              <div>
                <span className="text-gray-400">市净率</span>
                <div className="text-white font-medium">{selectedStock.pb}</div>
              </div>
            )}
            {selectedStock.marketCap && (
              <div>
                <span className="text-gray-400">市值</span>
                <div className="text-white font-medium">
                  {(selectedStock.marketCap / 100000000).toFixed(0)}亿
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
