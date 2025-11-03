'use client'


export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import StockSearch from './components/StockSearch'
import AuthGuard from '@/components/AuthGuard'

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
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)

  // 获取自选股列表
  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        // 获取用户的自选股
        const supabase = (await import('@/lib/supabase')).getSupabaseBrowser()
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.access_token) {
          const response = await fetch('/api/watchlists', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          })
          const data = await response.json()

          if (data.success) {
            setWatchlist(data.data)

            // 获取这些股票的实时价格
            if (data.data.length > 0) {
              const tickers = data.data.map((item: WatchlistStock) => item.ticker).join(',')
              const priceResponse = await fetch(`/api/stocks?tickers=${tickers}&includeTestData=true`)
              const priceData = await priceResponse.json()

              if (priceData.success) {
                const priceMap: Record<string, Stock> = {}
                priceData.data.forEach((stock: Stock) => {
                  priceMap[stock.ticker] = stock
                })
                setStockPrices(priceMap)
              }
            }
          }
        } else {
          // 如果没有登录，显示空的自选股列表
          setWatchlist([])
        }
      } catch (error) {
        console.error('获取自选股失败:', error)
        setWatchlist([])
      }
    }

    fetchWatchlist()
  }, [])

  const handleStockSelect = (stock: Stock) => {
    setSelectedStock(stock)
    setAiAnalysis(null) // 清除之前的分析结果
  }

  // AI分析功能
  const handleAIAnalysis = async (ticker: string) => {
    if (!ticker) return

    setAnalysisLoading(true)
    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticker })
      })

      const data = await response.json()

      if (data.success) {
        setAiAnalysis(data.data.analysis)
      } else {
        setAiAnalysis(`分析失败：${data.error}`)
      }
    } catch (error) {
      console.error('AI分析请求失败:', error)
      setAiAnalysis('分析请求失败，请稍后重试')
    } finally {
      setAnalysisLoading(false)
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen relative">
        {/* 粒子流背景 */}
        <div className="particle-background"></div>

        <div className="relative z-10">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-12">
              <h1 className="hero-title mb-4">
                个股AI分析
              </h1>
              <p className="text-xl text-muted-foreground mb-2">
                AI驱动 · 智能分析 · 精准决策
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                  <span>实时分析</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span>智能推荐</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                  <span>专业指标</span>
                </div>
              </div>
            </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 股票搜索区域 */}
          <div className="lg:col-span-1">
            <StockSearch
              onStockSelect={handleStockSelect}
              selectedStock={selectedStock}
            />

            {/* 自选股列表 */}
            <div className="glass-card p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <span className="w-1 h-6 bg-gradient-to-b from-primary to-purple-500 rounded-full mr-3"></span>
                我的自选股
              </h3>
              <div className="space-y-3">
                {watchlist.length > 0 ? watchlist.map((stock, index) => {
                  const priceData = stockPrices[stock.ticker]
                  return (
                    <div
                      key={index}
                      className="group glass-card p-4 hover:glow-border transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex justify-between items-center">
                        <div onClick={() => priceData && handleStockSelect(priceData)} className="flex-1">
                          <div className="text-white font-medium group-hover:text-primary transition-colors">
                            {stock.name || stock.ticker}
                          </div>
                          <div className="text-gray-400 text-sm">{stock.ticker} · {stock.industry}</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            {priceData ? (
                              <>
                                <div className="text-white font-bold">{priceData.price.toFixed(2)}</div>
                                <div className={`text-sm font-medium ${priceData.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {priceData.changePercent >= 0 ? '+' : ''}{priceData.changePercent.toFixed(2)}%
                                </div>
                              </>
                            ) : (
                              <div className="text-gray-400 text-sm">加载中...</div>
                            )}
                          </div>
                          {priceData && (
                            <div className="flex flex-col space-y-1">
                              <button
                                onClick={() => handleStockSelect(priceData)}
                                className="px-3 py-1 text-xs bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary/30 transition-all"
                              >
                                分析
                              </button>
                              <a
                                href={`/stocks/${stock.ticker}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-all text-center"
                              >
                                K线
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                }) : (
                  <div className="text-center text-gray-400 py-8">
                    <div className="text-2xl mb-4">📊</div>
                    <p className="text-lg mb-2">暂无自选股</p>
                    <p className="text-sm">请先搜索并选择股票</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 分析结果区域 */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <span className="w-1 h-6 bg-gradient-to-b from-primary to-purple-500 rounded-full mr-3"></span>
                AI智能分析
              </h3>
              {selectedStock ? (
                <div className="space-y-6">
                  <div className="glass-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-2xl font-bold text-white mb-2">{selectedStock.name}</h4>
                        <p className="text-gray-400 text-lg">{selectedStock.ticker} · {selectedStock.industry}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold tech-number mb-1">¥{selectedStock.price.toFixed(2)}</div>
                        <div className={`text-lg font-bold ${selectedStock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex space-x-3">
                        <a
                          href={`/stocks/${selectedStock.ticker}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl hover:from-purple-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
                        >
                          查看K线图
                        </a>
                        <button
                          onClick={() => handleAIAnalysis(selectedStock.ticker)}
                          disabled={analysisLoading}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {analysisLoading ? '分析中...' : '开始AI分析'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl">
                    <div className="text-primary font-bold mb-4 flex items-center">
                      <span className="text-2xl mr-2">🤖</span>
                      AI 分析结果
                    </div>
                    {analysisLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mr-3"></div>
                        <span className="text-gray-300">AI正在分析中，请稍候...</span>
                      </div>
                    ) : aiAnalysis ? (
                      <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {aiAnalysis}
                      </div>
                    ) : (
                      <p className="text-gray-300 leading-relaxed">
                        AI 分析功能已集成 Gemini Pro 模型，可为您提供专业的技术分析、基本面分析和市场情绪分析。
                        点击上方"开始AI分析"按钮获取详细分析报告。
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-16">
                  <div className="text-6xl mb-6">🧠</div>
                  <h3 className="text-2xl font-bold text-primary mb-4">AI 智能分析</h3>
                  <p className="text-lg mb-2">请选择股票开始AI分析</p>
                  <p className="text-sm text-muted-foreground">今日剩余分析次数：5次</p>
                </div>
              )}
            </div>

            {/* 专业指标仪表盘 */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <span className="w-1 h-6 bg-gradient-to-b from-primary to-purple-500 rounded-full mr-3"></span>
                专业指标
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-6 glass-card hover:glow-border transition-all duration-300">
                  <div className="text-gray-400 text-sm mb-2 font-medium">PE比率</div>
                  <div className="text-white text-2xl font-bold tech-number">
                    {selectedStock?.peRatio ? selectedStock.peRatio.toFixed(2) : '--'}
                  </div>
                  <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-3"></div>
                </div>
                <div className="text-center p-6 glass-card hover:glow-border transition-all duration-300">
                  <div className="text-gray-400 text-sm mb-2 font-medium">PB比率</div>
                  <div className="text-white text-2xl font-bold tech-number">
                    {selectedStock?.pbRatio ? selectedStock.pbRatio.toFixed(2) : '--'}
                  </div>
                  <div className="w-full h-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mt-3"></div>
                </div>
                <div className="text-center p-6 glass-card hover:glow-border transition-all duration-300">
                  <div className="text-gray-400 text-sm mb-2 font-medium">ROE</div>
                  <div className="text-white text-2xl font-bold tech-number">--</div>
                  <div className="w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-3"></div>
                </div>
                <div className="text-center p-6 glass-card hover:glow-border transition-all duration-300">
                  <div className="text-gray-400 text-sm mb-2 font-medium">市值</div>
                  <div className="text-white text-2xl font-bold tech-number">
                    {selectedStock?.marketCap ? `${(selectedStock.marketCap / 100000000).toFixed(0)}亿` : '--'}
                  </div>
                  <div className="w-full h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mt-3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </AuthGuard>
  )
}
