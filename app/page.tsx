'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TrendingUp, TrendingDown, Search, Star, BarChart3, Newspaper, Brain, AlertTriangle, RefreshCw, Activity, Zap, Target, Briefcase } from 'lucide-react'

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
      <div className="min-h-screen relative">
        {/* 粒子流背景 */}
        <div className="particle-background"></div>

        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center glass-card p-8">
            <div className="relative">
              <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-6 text-primary" />
              <div className="absolute inset-0 h-12 w-12 mx-auto rounded-full bg-primary/20 animate-pulse"></div>
            </div>
            <p className="text-xl font-medium text-foreground">正在加载数据...</p>
            <p className="text-muted-foreground mt-2">连接到智能分析系统</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* 粒子流背景 */}
      <div className="particle-background"></div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          {/* 页面标题 - 科技感设计 */}
          <div className="text-center mb-12">
            <h1 className="hero-title mb-4">
              智能股票分析平台
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
              AI驱动 · 实时分析 · 精准决策
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Activity className="h-4 w-4 text-primary" />
                <span>实时数据</span>
              </div>
              <div className="flex items-center space-x-1">
                <Brain className="h-4 w-4 text-primary" />
                <span>AI分析</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="h-4 w-4 text-primary" />
                <span>毫秒响应</span>
              </div>
            </div>
          </div>

          {/* 测试数据警告 - 科技感设计 */}
          {hasTestData && (
            <Alert className="mb-8 glass-card border-amber-500/30 bg-amber-500/10">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <AlertDescription className="text-amber-200">
                <span className="font-medium">演示模式</span> - 当前显示测试数据，生产环境将切换到实时数据源
                <Button
                  variant="link"
                  className="p-0 h-auto text-amber-400 hover:text-amber-300 underline ml-2"
                  onClick={handleRefresh}
                >
                  刷新数据
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* 错误提示 - 科技感设计 */}
          {error && (
            <Alert className="mb-8 glass-card border-red-500/30 bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <AlertDescription className="text-red-200">
                <span className="font-medium">连接异常</span> - {error}
                <Button
                  variant="link"
                  className="p-0 h-auto text-red-400 hover:text-red-300 underline ml-2"
                  onClick={handleRefresh}
                >
                  重新连接
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* 市场指数概览 - 大气科技感设计 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {indices.map((index) => (
              <Card key={index.code} className="glass-card hover:glow-border transition-all duration-300 group">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {index.name}
                      </h3>
                      <p className="text-3xl font-bold tech-number">
                        {index.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right space-y-2">
                      <div className={`flex items-center justify-end ${
                        index.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {index.changePercent >= 0 ? (
                          <TrendingUp className="h-5 w-5 mr-2" />
                        ) : (
                          <TrendingDown className="h-5 w-5 mr-2" />
                        )}
                        <span className="text-lg font-bold">
                          {index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                        </span>
                      </div>
                      <p className={`text-sm font-medium ${
                        index.change >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)}
                      </p>
                      {index.isTestData && (
                        <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                          演示数据
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* 数据流动效果 */}
                  <div className="data-flow mt-4 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 功能导航 - 五板块架构 */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
            <Button className="glass-card glow-button h-24 flex flex-col items-center justify-center space-y-2 group">
              <Activity className="h-8 w-8 group-hover:scale-110 transition-transform" />
              <span className="font-medium">市场行情</span>
              <span className="text-xs opacity-80">实时数据</span>
            </Button>
            <Button variant="outline" className="glass-card glow-border h-24 flex flex-col items-center justify-center space-y-2 group hover:bg-primary/10">
              <Target className="h-8 w-8 group-hover:scale-110 transition-transform" />
              <span className="font-medium">策略选股</span>
              <span className="text-xs opacity-80">智能筛选</span>
            </Button>
            <Button variant="outline" className="glass-card glow-border h-24 flex flex-col items-center justify-center space-y-2 group hover:bg-primary/10">
              <Brain className="h-8 w-8 group-hover:scale-110 transition-transform" />
              <span className="font-medium">AI分析</span>
              <span className="text-xs opacity-80">深度解读</span>
            </Button>
            <Button variant="outline" className="glass-card glow-border h-24 flex flex-col items-center justify-center space-y-2 group hover:bg-primary/10">
              <BarChart3 className="h-8 w-8 group-hover:scale-110 transition-transform" />
              <span className="font-medium">量化工作台</span>
              <span className="text-xs opacity-80">专业回测</span>
            </Button>
            <Button variant="outline" className="glass-card h-24 flex flex-col items-center justify-center space-y-2 opacity-50 cursor-not-allowed">
              <Briefcase className="h-8 w-8" />
              <span className="font-medium">交易系统</span>
              <span className="text-xs">即将开放</span>
            </Button>
          </div>

          {/* 股票列表 - 科技感设计 */}
          <Card className="glass-card">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-foreground flex items-center space-x-3">
                  <div className="h-8 w-1 bg-gradient-to-b from-primary to-purple-500 rounded-full"></div>
                  <span>热门股票</span>
                </CardTitle>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="搜索股票代码或名称..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-72 glass-card border-primary/30 focus:border-primary"
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={handleRefresh} className="glow-border">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    刷新
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredStocks.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg text-muted-foreground">暂无股票数据</p>
                    <p className="text-sm text-muted-foreground mt-2">请检查数据库连接或刷新页面</p>
                  </div>
                ) : (
                  filteredStocks.map((stock) => (
                    <div key={stock.ticker} className="glass-card p-6 hover:glow-border transition-all duration-300 group cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div className="space-y-1">
                            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                              {stock.name}
                            </h3>
                            <p className="text-sm text-muted-foreground font-mono">{stock.ticker}</p>
                            {stock.isTestData && (
                              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 text-xs">
                                演示数据
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <p className="text-2xl font-bold tech-number">
                            ¥{stock.price.toFixed(2)}
                          </p>
                          <div className={`flex items-center justify-end space-x-2 ${
                            stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {stock.changePercent >= 0 ? (
                              <TrendingUp className="h-5 w-5" />
                            ) : (
                              <TrendingDown className="h-5 w-5" />
                            )}
                            <span className="text-lg font-bold">
                              {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            成交量: <span className="font-mono">{formatNumber(stock.volume)}</span>
                          </p>
                        </div>
                      </div>

                      {/* 数据流动效果 */}
                      <div className="data-flow mt-4 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-full"></div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
