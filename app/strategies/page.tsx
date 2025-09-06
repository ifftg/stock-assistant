'use client'

import { useState } from 'react'

// 定义11种InStock策略
const strategies = [
  {
    id: 'value_strategy',
    name: '经典价值策略',
    icon: '💎',
    color: 'blue',
    description: 'PE < 15, PB < 1.5, 市值 > 200亿',
    criteria: ['PE < 15', 'PB < 1.5', '市值 > 200亿']
  },
  {
    id: 'volume_surge',
    name: '放量上涨策略',
    icon: '📈',
    color: 'green',
    description: '成交量/5日均量≥2，成交额≥2亿',
    criteria: ['成交量/5日均量 ≥ 2', '成交额 ≥ 2亿', '当日涨幅 > 0%']
  },
  {
    id: 'ma_bullish',
    name: '均线多头策略',
    icon: '📊',
    color: 'purple',
    description: 'MA30向上，30日前<20日前<10日前<当日',
    criteria: ['MA5 > MA10 > MA20', '均线向上发散', '价格在均线之上']
  },
  {
    id: 'tarmac_strategy',
    name: '停机坪策略',
    icon: '✈️',
    color: 'orange',
    description: '15日内有涨幅>9.5%，后续3日高开收涨',
    criteria: ['15日内涨幅 > 9.5%', '后续3日高开', '连续收涨']
  },
  {
    id: 'annual_line_callback',
    name: '回踩年线策略',
    icon: '🔄',
    color: 'cyan',
    description: '突破年线后回踩，伴随缩量',
    criteria: ['突破年线', '回踩确认', '缩量回调']
  },
  {
    id: 'platform_breakthrough',
    name: '突破平台策略',
    icon: '🚀',
    color: 'red',
    description: '60日内收盘价≥60日均线，放量上涨',
    criteria: ['收盘价 ≥ 60日均线', '放量突破', '平台整理']
  },
  {
    id: 'turtle_trading',
    name: '海龟交易法则',
    icon: '🐢',
    color: 'emerald',
    description: '收盘价≥最近60日最高收盘价',
    criteria: ['收盘价 ≥ 60日最高', '突破新高', '趋势确认']
  },
  {
    id: 'narrow_flag',
    name: '高而窄的旗形',
    icon: '🏁',
    color: 'yellow',
    description: '24-10日前连续两天涨幅≥9.5%',
    criteria: ['连续涨停', '旗形整理', '缩量调整']
  },
  {
    id: 'low_atr_growth',
    name: '低ATR成长',
    icon: '📉',
    color: 'indigo',
    description: '10日最高/最低收盘价≥1.1倍',
    criteria: ['低波动率', '稳定成长', 'ATR指标']
  },
  {
    id: 'fundamental_screening',
    name: '基本面选股',
    icon: '📋',
    color: 'pink',
    description: 'PE≤20且>0，PB≤10，ROE≥15%',
    criteria: ['PE ≤ 20 且 > 0', 'PB ≤ 10', 'ROE ≥ 15%']
  },
  {
    id: 'volume_limit_down',
    name: '放量跌停',
    icon: '📉',
    color: 'gray',
    description: '跌>9.5%，成交额≥2亿，量≥5日均量4倍',
    criteria: ['跌幅 > 9.5%', '成交额 ≥ 2亿', '量 ≥ 5日均量4倍']
  }
]

export default function StrategiesPage() {
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null)
  const [screeningResults, setScreeningResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleStrategyClick = async (strategyId: string) => {
    setSelectedStrategy(strategyId)
    setLoading(true)

    try {
      const response = await fetch(`/api/strategies/screen?strategy=${strategyId}`)
      const data = await response.json()

      if (data.success) {
        setScreeningResults(data.data || [])
      } else {
        console.error('筛选失败:', data.error)
        setScreeningResults([])
      }
    } catch (error) {
      console.error('API调用失败:', error)
      setScreeningResults([])
    } finally {
      setLoading(false)
    }
  }

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { gradient: string, border: string, text: string }> = {
      blue: { gradient: 'from-blue-500 to-blue-600', border: 'border-blue-400', text: 'text-blue-400' },
      green: { gradient: 'from-green-500 to-green-600', border: 'border-green-400', text: 'text-green-400' },
      purple: { gradient: 'from-purple-500 to-purple-600', border: 'border-purple-400', text: 'text-purple-400' },
      orange: { gradient: 'from-orange-500 to-orange-600', border: 'border-orange-400', text: 'text-orange-400' },
      cyan: { gradient: 'from-cyan-500 to-cyan-600', border: 'border-cyan-400', text: 'text-cyan-400' },
      red: { gradient: 'from-red-500 to-red-600', border: 'border-red-400', text: 'text-red-400' },
      emerald: { gradient: 'from-emerald-500 to-emerald-600', border: 'border-emerald-400', text: 'text-emerald-400' },
      yellow: { gradient: 'from-yellow-500 to-yellow-600', border: 'border-yellow-400', text: 'text-yellow-400' },
      indigo: { gradient: 'from-indigo-500 to-indigo-600', border: 'border-indigo-400', text: 'text-indigo-400' },
      pink: { gradient: 'from-pink-500 to-pink-600', border: 'border-pink-400', text: 'text-pink-400' },
      gray: { gradient: 'from-gray-500 to-gray-600', border: 'border-gray-400', text: 'text-gray-400' }
    }
    return colorMap[color] || colorMap.blue
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">策略选股</h1>
          <p className="text-xl text-gray-300">智能策略筛选 · 精准选股工具</p>
          <p className="text-sm text-gray-400 mt-2">基于InStock开源项目的11种成熟策略</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {strategies.map((strategy) => {
            const colorClasses = getColorClasses(strategy.color)
            const isSelected = selectedStrategy === strategy.id

            return (
              <div
                key={strategy.id}
                className={`bg-white/10 backdrop-blur-md rounded-2xl p-6 border transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                  isSelected
                    ? `${colorClasses.border} shadow-lg shadow-${strategy.color}-400/20`
                    : 'border-white/20 hover:border-white/40'
                }`}
                onClick={() => handleStrategyClick(strategy.id)}
              >
                <div className="text-center mb-4">
                  <div className="text-3xl mb-2">{strategy.icon}</div>
                  <h3 className="text-lg font-semibold text-white">{strategy.name}</h3>
                </div>

                <div className="space-y-2 mb-6">
                  {strategy.criteria.map((criterion, index) => (
                    <div key={index} className="text-gray-300 text-sm">
                      • {criterion}
                    </div>
                  ))}
                </div>

                <div className="text-center mb-4">
                  {loading && isSelected ? (
                    <div className="text-lg font-bold text-yellow-400">筛选中...</div>
                  ) : (
                    <>
                      <div className={`text-xl font-bold ${colorClasses.text}`}>
                        {isSelected ? `${screeningResults.length}只` : '--'}
                      </div>
                      <div className="text-sm text-gray-400">符合条件股票</div>
                    </>
                  )}
                </div>

                <button
                  className={`w-full bg-gradient-to-r ${colorClasses.gradient} text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl ${
                    loading && isSelected ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                  }`}
                  disabled={loading && isSelected}
                >
                  {loading && isSelected ? '筛选中...' : '开始筛选'}
                </button>
              </div>
            )
          })}
        </div>

        {/* 筛选结果区域 */}
        <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">筛选结果</h3>
            {selectedStrategy && (
              <div className="text-sm text-gray-400">
                策略: {strategies.find(s => s.id === selectedStrategy)?.name}
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center text-gray-400 py-8">
              <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>正在筛选股票，请稍候...</p>
            </div>
          ) : screeningResults.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="pb-3 text-gray-300 font-medium">股票代码</th>
                    <th className="pb-3 text-gray-300 font-medium">股票名称</th>
                    <th className="pb-3 text-gray-300 font-medium">当前价格</th>
                    <th className="pb-3 text-gray-300 font-medium">涨跌幅</th>
                    <th className="pb-3 text-gray-300 font-medium">成交量</th>
                    <th className="pb-3 text-gray-300 font-medium">市值</th>
                  </tr>
                </thead>
                <tbody>
                  {screeningResults.map((stock, index) => (
                    <tr key={index} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="py-3 text-blue-400 font-mono">{stock.ticker}</td>
                      <td className="py-3 text-white">{stock.name}</td>
                      <td className="py-3 text-white">¥{stock.currentPrice?.toFixed(2) || '--'}</td>
                      <td className={`py-3 font-medium ${
                        (stock.changePercent || 0) >= 0 ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {stock.changePercent ? `${stock.changePercent > 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%` : '--'}
                      </td>
                      <td className="py-3 text-gray-300">{stock.volume ? (stock.volume / 10000).toFixed(0) + '万' : '--'}</td>
                      <td className="py-3 text-gray-300">{stock.marketCap ? (stock.marketCap / 100000000).toFixed(0) + '亿' : '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : selectedStrategy ? (
            <div className="text-center text-gray-400 py-8">
              <div className="text-2xl mb-4">📊</div>
              <p>该策略暂无符合条件的股票</p>
              <p className="text-sm mt-2">请尝试其他策略或稍后再试</p>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              <div className="text-2xl mb-4">🎯</div>
              <p>请选择上方策略开始筛选股票</p>
              <p className="text-sm mt-2">基于InStock项目的11种成熟策略</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

