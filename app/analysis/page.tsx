'use client'


export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import StockSearch from './components/StockSearch'

interface Stock {
  ticker: string
  name: string
  industry: string
  market: string
  price: number
  changePercent: number
  peRatio?: number
  pbRatio?: number
  marketCap?: number
}

interface WatchlistStock {
  ticker: string
  name: string | null
  industry: string | null
  addedAt: string
  notes: string | null
}

export default function AnalysisPage() {
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [watchlist, setWatchlist] = useState<WatchlistStock[]>([])
  const [stockPrices, setStockPrices] = useState<Record<string, Stock>>({})

  // 获取自选股列表（模拟，实际需要认证）
  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        // 模拟自选股数据，实际应该调用 /api/watchlists
        const mockWatchlist: WatchlistStock[] = [
          { ticker: '000001', name: '平安银行', industry: '银行', addedAt: '2024-01-01', notes: null },
          { ticker: '600519', name: '贵州茅台', industry: '食品饮料', addedAt: '2024-01-02', notes: null },
          { ticker: '000858', name: '五粮液', industry: '食品饮料', addedAt: '2024-01-03', notes: null },
          { ticker: '600036', name: '招商银行', industry: '银行', addedAt: '2024-01-04', notes: null }
        ]
        setWatchlist(mockWatchlist)

        // 获取这些股票的实时价格
        const response = await fetch('/api/stocks?includeTestData=true&limit=50')
        const data = await response.json()
        if (data.success) {
          const priceMap: Record<string, Stock> = {}
          data.data.forEach((stock: Stock) => {
            priceMap[stock.ticker] = stock
          })
          setStockPrices(priceMap)
        }
      } catch (error) {
        console.error('获取自选股失败:', error)
      }
    }

    fetchWatchlist()
  }, [])

  const handleStockSelect = (stock: Stock) => {
    setSelectedStock(stock)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            个股AI分析
          </h1>
          <p className="text-xl text-gray-300">
            智能分析工具 · AI驱动决策
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 股票搜索区域 */}
          <div className="lg:col-span-1">
            <StockSearch
              onStockSelect={handleStockSelect}
              selectedStock={selectedStock}
            />

            {/* 自选股列表 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">我的自选股</h3>
              <div className="space-y-3">
                {watchlist.length > 0 ? watchlist.map((stock, index) => {
                  const priceData = stockPrices[stock.ticker]
                  return (
                    <div
                      key={index}
                      onClick={() => priceData && handleStockSelect(priceData)}
                      className="flex justify-between items-center p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-200 cursor-pointer"
                    >
                      <div>
                        <div className="text-white font-medium">{stock.name || stock.ticker}</div>
                        <div className="text-gray-400 text-sm">{stock.ticker} · {stock.industry}</div>
                      </div>
                      <div className="text-right">
                        {priceData ? (
                          <>
                            <div className="text-white">{priceData.price.toFixed(2)}</div>
                            <div className={`text-sm ${priceData.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {priceData.changePercent >= 0 ? '+' : ''}{priceData.changePercent.toFixed(2)}%
                            </div>
                          </>
                        ) : (
                          <div className="text-gray-400 text-sm">加载中...</div>
                        )}
                      </div>
                    </div>
                  )
                }) : (
                  <div className="text-center text-gray-400 py-4">
                    <p>暂无自选股</p>
                    <p className="text-sm mt-1">请先搜索并选择股票</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 分析结果区域 */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">AI智能分析</h3>
              {selectedStock ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{selectedStock.name}</h4>
                      <p className="text-gray-400">{selectedStock.ticker} · {selectedStock.industry}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{selectedStock.price.toFixed(2)}</div>
                      <div className={`text-sm ${selectedStock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <div className="text-blue-400 font-medium mb-2">💡 AI 分析提示</div>
                    <p className="text-gray-300 text-sm">
                      AI 分析功能正在开发中，将提供技术分析、基本面分析和市场情绪分析。
                      当前显示的是基础数据，完整的 AI 分析功能即将上线。
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-12">
                  <div className="text-3xl mb-4 font-bold text-blue-400">AI 分析</div>
                  <p className="text-lg mb-2">请选择股票开始AI分析</p>
                  <p className="text-sm">今日剩余分析次数：5次</p>
                </div>
              )}
            </div>

            {/* 专业指标仪表盘 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">专业指标</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">PE比率</div>
                  <div className="text-white text-xl font-bold">
                    {selectedStock?.peRatio ? selectedStock.peRatio.toFixed(2) : '--'}
                  </div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">PB比率</div>
                  <div className="text-white text-xl font-bold">
                    {selectedStock?.pbRatio ? selectedStock.pbRatio.toFixed(2) : '--'}
                  </div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">ROE</div>
                  <div className="text-white text-xl font-bold">--</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">市值</div>
                  <div className="text-white text-xl font-bold">
                    {selectedStock?.marketCap ? `${(selectedStock.marketCap / 100000000).toFixed(0)}亿` : '--'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
