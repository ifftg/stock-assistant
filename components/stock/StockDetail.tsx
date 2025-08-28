'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, BarChart3, Activity, DollarSign, Users } from 'lucide-react'
import { getStockInfo, getHistoricalData, formatPrice, formatChange, formatVolume, formatMarketCap, type StockInfo, type HistoricalData } from '@/lib/stock-api'

interface StockDetailProps {
  symbol: string
  onClose?: () => void
  className?: string
}

export default function StockDetail({ symbol, onClose, className = "" }: StockDetailProps) {
  const [stock, setStock] = useState<StockInfo | null>(null)
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'chart' | 'data'>('overview')

  // 获取股票详细信息
  useEffect(() => {
    const fetchStockDetail = async () => {
      setLoading(true)
      setError('')

      try {
        const [stockInfo, historical] = await Promise.all([
          getStockInfo(symbol),
          getHistoricalData(symbol, 30)
        ])

        if (stockInfo) {
          setStock(stockInfo)
          setHistoricalData(historical)
        } else {
          setError('未找到股票信息')
        }
      } catch (err) {
        setError('获取股票信息失败')
        console.error('获取股票详情失败:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStockDetail()
  }, [symbol])

  if (loading) {
    return (
      <div className={`bg-dark-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-600 rounded w-48"></div>
          <div className="h-6 bg-gray-600 rounded w-32"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-600 rounded"></div>
            <div className="h-20 bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !stock) {
    return (
      <div className={`bg-dark-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 ${className}`}>
        <div className="text-center">
          <div className="text-red-400 mb-4">{error || '股票信息不存在'}</div>
          {onClose && (
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              关闭
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-dark-800/50 backdrop-blur-sm rounded-xl border border-gray-700 ${className}`}>
      {/* 头部信息 */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {stock.symbol} {stock.name}
            </h1>
            <p className="text-gray-400">
              最后更新: {new Date(stock.lastUpdate).toLocaleString()}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* 价格信息 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-3xl font-bold text-white mb-2">
              ¥{formatPrice(stock.price)}
            </div>
            <div className={`flex items-center text-lg ${
              stock.change >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {stock.change >= 0 ? (
                <TrendingUp className="h-5 w-5 mr-2" />
              ) : (
                <TrendingDown className="h-5 w-5 mr-2" />
              )}
              {formatChange(stock.change, stock.changePercent)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">52周最高</span>
              <div className="text-white font-medium">
                ¥{stock.high52w?.toFixed(2) || '--'}
              </div>
            </div>
            <div>
              <span className="text-gray-400">52周最低</span>
              <div className="text-white font-medium">
                ¥{stock.low52w?.toFixed(2) || '--'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 标签页 */}
      <div className="border-b border-gray-700">
        <nav className="flex space-x-8 px-6">
          {[
            { key: 'overview', label: '概览', icon: BarChart3 },
            { key: 'chart', label: '图表', icon: Activity },
            { key: 'data', label: '数据', icon: DollarSign }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                activeTab === key
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* 内容区域 */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 基本指标 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">基本指标</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">成交量</span>
                  <span className="text-white">{formatVolume(stock.volume)}</span>
                </div>
                
                {stock.marketCap && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">市值</span>
                    <span className="text-white">{formatMarketCap(stock.marketCap)}</span>
                  </div>
                )}
                
                {stock.pe && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">市盈率</span>
                    <span className="text-white">{stock.pe}</span>
                  </div>
                )}
                
                {stock.pb && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">市净率</span>
                    <span className="text-white">{stock.pb}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 价格区间 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">价格区间</h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">52周区间</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: stock.high52w && stock.low52w 
                          ? `${((stock.price - stock.low52w) / (stock.high52w - stock.low52w)) * 100}%`
                          : '50%'
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400 mt-1">
                    <span>¥{stock.low52w?.toFixed(2)}</span>
                    <span>¥{stock.high52w?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 交易信息 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">交易信息</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">当前价格</span>
                  <span className="text-white">¥{formatPrice(stock.price)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">涨跌幅</span>
                  <span className={stock.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {stock.changePercent.toFixed(2)}%
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">涨跌额</span>
                  <span className={stock.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chart' && (
          <div className="text-center py-12">
            <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">图表功能</h3>
            <p className="text-gray-400">K线图表功能即将推出</p>
          </div>
        )}

        {activeTab === 'data' && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">历史数据</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 text-gray-400">日期</th>
                    <th className="text-right py-2 text-gray-400">开盘</th>
                    <th className="text-right py-2 text-gray-400">最高</th>
                    <th className="text-right py-2 text-gray-400">最低</th>
                    <th className="text-right py-2 text-gray-400">收盘</th>
                    <th className="text-right py-2 text-gray-400">成交量</th>
                  </tr>
                </thead>
                <tbody>
                  {historicalData.slice(0, 10).map((data) => (
                    <tr key={data.date} className="border-b border-gray-800">
                      <td className="py-2 text-white">{data.date}</td>
                      <td className="py-2 text-right text-white">¥{data.open.toFixed(2)}</td>
                      <td className="py-2 text-right text-green-400">¥{data.high.toFixed(2)}</td>
                      <td className="py-2 text-right text-red-400">¥{data.low.toFixed(2)}</td>
                      <td className="py-2 text-right text-white">¥{data.close.toFixed(2)}</td>
                      <td className="py-2 text-right text-gray-400">{formatVolume(data.volume)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
