'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TrendingUp, TrendingDown, Search, Star, BarChart3, Newspaper, Brain, AlertTriangle, RefreshCw } from 'lucide-react'

// 数据类型定义
interface Stock {
  ticker: string
  name: string
  price: number
  changePercent: number
  volume: number
  turnover: number
  peRatio: number
  pbRatio: number
  marketCap: number
  isTestData: boolean
  dataSource: string
  lastUpdate: string
}

interface MarketIndex {
  code: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  turnover: number
  isTestData: boolean
  dataSource: string
  updateTime: string
}

export default function HomePage() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [indices, setIndices] = useState<MarketIndex[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasTestData, setHasTestData] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // 获取股票数据
  const fetchStocks = async () => {
    try {
      const response = await fetch('/api/stocks?includeTestData=true&limit=10')
      const result = await response.json()
      
      if (result.success) {
        setStocks(result.data)
        setHasTestData(result.meta.hasTestData)
      } else {
        setError(result.error || '获取股票数据失败')
      }
    } catch (err) {
      setError('网络错误，无法获取股票数据')
      console.error('获取股票数据失败:', err)
    }
  }

  // 获取市场指数数据
  const fetchIndices = async () => {
    try {
      const response = await fetch('/api/market-indices?includeTestData=true')
      const result = await response.json()
      
      if (result.success) {
        setIndices(result.data)
      } else {
        setError(result.error || '获取市场指数失败')
      }
    } catch (err) {
      setError('网络错误，无法获取市场指数')
      console.error('获取市场指数失败:', err)
    }
  }

  // 初始化数据
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchStocks(), fetchIndices()])
      setLoading(false)
    }
    
    loadData()
  }, [])

  // 刷新数据
  const handleRefresh = async () => {
    setLoading(true)
    await Promise.all([fetchStocks(), fetchIndices()])
    setLoading(false)
  }

  // 过滤股票
  const filteredStocks = stocks.filter(stock => 
    stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.ticker.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 格式化数字
  const formatNumber = (num: number, decimals: number = 2) => {
    if (num >= 1e8) return (num / 1e8).toFixed(decimals) + '亿'
    if (num >= 1e4) return (num / 1e4).toFixed(decimals) + '万'
    return num.toFixed(decimals)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">正在加载数据...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            智能股票分析平台
          </h1>
          <p className="text-gray-600">
            实时数据 · 智能分析 · 精准决策
          </p>
        </div>

        {/* 测试数据警告 */}
        {hasTestData && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              当前显示的数据包含测试数据，仅供演示使用。生产环境请切换到实时数据源。
              <Button 
                variant="link" 
                className="p-0 h-auto text-amber-800 underline ml-2"
                onClick={handleRefresh}
              >
                刷新数据
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* 错误提示 */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
              <Button 
                variant="link" 
                className="p-0 h-auto text-red-800 underline ml-2"
                onClick={handleRefresh}
              >
                重试
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* 市场指数概览 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {indices.map((index) => (
            <Card key={index.code} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{index.name}</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {index.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center ${
                      index.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {index.changePercent >= 0 ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      <span className="font-semibold">
                        {index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)}
                    </p>
                    {index.isTestData && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        测试数据
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 功能导航 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <Star className="h-6 w-6 mb-2" />
            <span>自选股</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <BarChart3 className="h-6 w-6 mb-2" />
            <span>技术分析</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <Brain className="h-6 w-6 mb-2" />
            <span>AI分析</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <Newspaper className="h-6 w-6 mb-2" />
            <span>财经资讯</span>
          </Button>
        </div>

        {/* 股票列表 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>热门股票</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="搜索股票..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredStocks.map((stock) => (
                <div key={stock.ticker} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{stock.name}</h3>
                      <p className="text-sm text-gray-500">{stock.ticker}</p>
                      {stock.isTestData && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          测试数据
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      ¥{stock.price.toFixed(2)}
                    </p>
                    <div className={`flex items-center justify-end ${
                      stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stock.changePercent >= 0 ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      <span className="font-semibold">
                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      成交量: {formatNumber(stock.volume)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
