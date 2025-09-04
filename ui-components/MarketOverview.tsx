// 大气的市场行情首页组件
// 文件路径: components/MarketOverview.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react'
import { MarketIndex, StockInfo } from './TestDataBadge'

interface MarketIndexData {
  code: string
  name: string
  current: number
  change: number
  changePercent: number
  volume: string
  isTestData?: boolean
  dataSource?: 'TEST' | 'API' | 'MANUAL'
}

interface StockRanking {
  ticker: string
  name: string
  price: number
  changePercent: number
  volume: string
  isTestData?: boolean
  dataSource?: 'TEST' | 'API' | 'MANUAL'
}

const MarketOverview: React.FC = () => {
  const [indices, setIndices] = useState<MarketIndexData[]>([])
  const [gainers, setGainers] = useState<StockRanking[]>([])
  const [losers, setLosers] = useState<StockRanking[]>([])
  const [volumeRanking, setVolumeRanking] = useState<StockRanking[]>([])

  // 模拟数据（实际项目中从API获取）- 明确标记为测试数据
  useEffect(() => {
    setIndices([
      { code: 'SH000001', name: '上证指数', current: 3234.56, change: 39.87, changePercent: 1.25, volume: '2,456亿', isTestData: true, dataSource: 'TEST' },
      { code: 'SZ399001', name: '深证成指', current: 12345.67, change: -123.45, changePercent: -0.99, volume: '3,123亿', isTestData: true, dataSource: 'TEST' },
      { code: 'SZ399006', name: '创业板指', current: 2567.89, change: 45.23, changePercent: 1.79, volume: '1,234亿', isTestData: true, dataSource: 'TEST' }
    ])

    setGainers([
      { ticker: '000001', name: '平安银行', price: 12.34, changePercent: 10.01, volume: '123亿', isTestData: true, dataSource: 'TEST' },
      { ticker: '000002', name: '万科A', price: 23.45, changePercent: 9.87, volume: '98亿', isTestData: true, dataSource: 'TEST' },
      { ticker: '000858', name: '五粮液', price: 156.78, changePercent: 8.65, volume: '87亿', isTestData: true, dataSource: 'TEST' }
    ])

    setLosers([
      { ticker: '600036', name: '招商银行', price: 34.56, changePercent: -5.43, volume: '76亿', isTestData: true, dataSource: 'TEST' },
      { ticker: '600519', name: '贵州茅台', price: 1678.90, changePercent: -4.32, volume: '65亿', isTestData: true, dataSource: 'TEST' },
      { ticker: '000858', name: '腾讯控股', price: 345.67, changePercent: -3.21, volume: '54亿', isTestData: true, dataSource: 'TEST' }
    ])

    setVolumeRanking([
      { ticker: '000001', name: '平安银行', price: 12.34, changePercent: 2.34, volume: '234亿', isTestData: true, dataSource: 'TEST' },
      { ticker: '600036', name: '招商银行', price: 34.56, changePercent: -1.23, volume: '198亿', isTestData: true, dataSource: 'TEST' },
      { ticker: '000002', name: '万科A', price: 23.45, changePercent: 3.45, volume: '176亿', isTestData: true, dataSource: 'TEST' }
    ])
  }, [])

  const formatNumber = (num: number) => {
    return num.toFixed(2)
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400'
    if (change < 0) return 'text-red-400'
    return 'text-gray-400'
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-6 h-6 text-green-400" />
    if (change < 0) return <TrendingDown className="w-6 h-6 text-red-400" />
    return <Activity className="w-6 h-6 text-gray-400" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* 全局测试数据警告横幅 */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center justify-center text-yellow-300">
            <TrendingUp className="w-5 h-5 mr-2" />
            <span className="font-semibold">演示模式</span>
            <span className="mx-2">|</span>
            <span className="text-sm">当前显示的是测试数据，非实时市场行情</span>
          </div>
        </div>
      </div>
      {/* 大盘指数仪表盘 */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          市场行情总览
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {indices.map((index) => (
            <MarketIndex
              key={index.code}
              indexName={index.name}
              currentPrice={index.current}
              changeAmount={index.change}
              changePercent={index.changePercent}
              isTestData={index.isTestData}
              dataSource={index.dataSource}
            />
          ))}
        </div>
      </div>

      {/* 市场热力图 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
        {/* 涨幅排行榜 */}
        <div className="glass-card p-6">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 text-green-400 mr-3" />
            涨幅排行
          </h3>
          <div className="space-y-4">
            {gainers.map((stock, index) => (
              <div key={stock.ticker} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors">
                <div>
                  <div className="text-white font-semibold">{stock.name}</div>
                  <div className="text-gray-400 text-sm">{stock.ticker}</div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">¥{formatNumber(stock.price)}</div>
                  <div className="text-green-400 font-semibold">+{formatNumber(stock.changePercent)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 跌幅排行榜 */}
        <div className="glass-card p-6">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <TrendingDown className="w-6 h-6 text-red-400 mr-3" />
            跌幅排行
          </h3>
          <div className="space-y-4">
            {losers.map((stock, index) => (
              <div key={stock.ticker} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors">
                <div>
                  <div className="text-white font-semibold">{stock.name}</div>
                  <div className="text-gray-400 text-sm">{stock.ticker}</div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">¥{formatNumber(stock.price)}</div>
                  <div className="text-red-400 font-semibold">{formatNumber(stock.changePercent)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 成交量排行 */}
        <div className="glass-card p-6">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Activity className="w-6 h-6 text-blue-400 mr-3" />
            成交量排行
          </h3>
          <div className="space-y-4">
            {volumeRanking.map((stock, index) => (
              <div key={stock.ticker} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors">
                <div>
                  <div className="text-white font-semibold">{stock.name}</div>
                  <div className="text-gray-400 text-sm">{stock.ticker}</div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">¥{formatNumber(stock.price)}</div>
                  <div className={`font-semibold ${getChangeColor(stock.changePercent)}`}>
                    {stock.changePercent > 0 ? '+' : ''}{formatNumber(stock.changePercent)}%
                  </div>
                  <div className="text-blue-400 text-sm">{stock.volume}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 财经资讯流 */}
      <div className="max-w-7xl mx-auto">
        <h3 className="text-3xl font-bold text-white mb-8 text-center">
          财经资讯
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: '央行宣布降准0.5个百分点', summary: '为支持实体经济发展，央行决定下调存款准备金率...', time: '2小时前' },
            { title: '科技股集体上涨，AI概念持续火热', summary: '受益于人工智能技术发展，相关概念股表现强劲...', time: '3小时前' },
            { title: '新能源汽车销量创新高', summary: '据统计，本月新能源汽车销量同比增长45%...', time: '5小时前' }
          ].map((news, index) => (
            <div key={index} className="glass-card p-6 hover:scale-105 transition-all duration-300 cursor-pointer">
              <h4 className="text-xl font-bold text-white mb-3">{news.title}</h4>
              <p className="text-gray-300 mb-4 line-clamp-3">{news.summary}</p>
              <div className="text-blue-400 text-sm">{news.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MarketOverview

/* 
配套CSS样式（添加到globals.css）：

.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(0, 212, 255, 0.3);
  box-shadow: 0 12px 40px rgba(0, 212, 255, 0.2);
}

使用方法：
1. 将此组件作为首页主要内容
2. 配合ParticleBackground作为背景
3. 集成实际的市场数据API
4. 添加实时数据更新功能
*/
