'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, RefreshCw, BarChart3, Target, Zap, RotateCcw } from 'lucide-react'
import { 
  screenStocks, 
  formatStrategyResult, 
  getStrategyTheme,
  STRATEGY_DESCRIPTIONS,
  type ScreeningRequest,
  type ScreeningResult 
} from '@/lib/screening-api'

interface StrategyCardProps {
  strategy: ScreeningRequest['strategy']
  onStockSelect?: (stock: ScreeningResult) => void
  className?: string
}

const STRATEGY_ICONS = {
  value_investing: BarChart3,
  growth: TrendingUp,
  momentum: Zap,
  contrarian: RotateCcw
}

export default function StrategyCard({ strategy, onStockSelect, className = "" }: StrategyCardProps) {
  const [results, setResults] = useState<ScreeningResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const strategyInfo = STRATEGY_DESCRIPTIONS[strategy]
  const theme = getStrategyTheme(strategy)
  const IconComponent = STRATEGY_ICONS[strategy]

  const handleScreen = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await screenStocks({ strategy, limit: 10 })
      
      if (response.success) {
        setResults(response.results)
        setLastUpdate(new Date())
      } else {
        setError(response.error || '选股失败')
      }
    } catch (err) {
      setError('网络错误，请重试')
      console.error('策略选股失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStockClick = (stock: ScreeningResult) => {
    onStockSelect?.(stock)
  }

  return (
    <div className={`bg-dark-800/50 backdrop-blur-sm rounded-xl border ${theme.border} ${className}`}>
      {/* 策略标题 */}
      <div className={`p-6 border-b border-gray-700 ${theme.bg}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${theme.bg} rounded-lg flex items-center justify-center`}>
              <IconComponent className={`h-5 w-5 ${theme.text}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{strategyInfo.name}</h3>
              <p className="text-sm text-gray-400">{strategyInfo.description}</p>
            </div>
          </div>
          
          <button
            onClick={handleScreen}
            disabled={loading}
            className={`flex items-center space-x-2 px-4 py-2 ${theme.button} text-white rounded-lg transition-colors disabled:opacity-50`}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? '选股中...' : '开始选股'}</span>
          </button>
        </div>

        {/* 策略标准 */}
        <div className="flex flex-wrap gap-2">
          {strategyInfo.criteria.map((criterion, index) => (
            <span
              key={index}
              className={`px-2 py-1 text-xs ${theme.bg} ${theme.text} rounded-full border ${theme.border}`}
            >
              {criterion}
            </span>
          ))}
        </div>
      </div>

      {/* 选股结果 */}
      <div className="p-6">
        {error && (
          <div className="text-center py-8">
            <div className="text-red-400 mb-2">{error}</div>
            <button
              onClick={handleScreen}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              重试
            </button>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <div className="text-gray-400">正在分析市场数据...</div>
          </div>
        )}

        {!loading && !error && results.length === 0 && (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <div className="text-gray-400 mb-2">点击"开始选股"获取推荐</div>
            <div className="text-sm text-gray-500">基于{strategyInfo.name}策略筛选优质股票</div>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            {/* 结果统计 */}
            <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
              <span>找到 {results.length} 只符合条件的股票</span>
              {lastUpdate && (
                <span>更新时间: {lastUpdate.toLocaleTimeString()}</span>
              )}
            </div>

            {/* 股票列表 */}
            {results.map((stock, index) => {
              const formatted = formatStrategyResult(stock)
              
              return (
                <button
                  key={stock.symbol}
                  onClick={() => handleStockClick(stock)}
                  className="w-full p-4 bg-dark-700/50 hover:bg-dark-700 rounded-lg transition-colors text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm text-gray-400">#{index + 1}</span>
                        <span className="font-medium text-white">{formatted.displayName}</span>
                        <span className="text-xs text-gray-500">评分: {stock.score.toFixed(1)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-white">{formatted.displayPrice}</span>
                        <span className={formatted.changeColor}>{formatted.displayChange}</span>
                        <span className="text-gray-400">量: {formatted.displayVolume}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-gray-400">市值</div>
                      <div className="text-white">{formatted.displayMarketCap}</div>
                    </div>
                  </div>

                  {/* 详细指标 */}
                  <div className="mt-3 pt-3 border-t border-gray-700 grid grid-cols-3 gap-4 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    <div>
                      <span className="text-gray-400">PE:</span>
                      <span className="text-white ml-1">{formatted.displayPE}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">PB:</span>
                      <span className="text-white ml-1">{formatted.displayPB}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">换手:</span>
                      <span className="text-white ml-1">{stock.turnoverRate.toFixed(2)}%</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
