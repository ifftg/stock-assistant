import React, { Suspense } from 'react'

export default function MarketPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            📈 市场行情
          </h1>
          <p className="text-xl text-gray-300">
            实时市场数据 · 全景行情展示
          </p>
        </div>

        {/* 大盘指数仪表盘 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-2">上证指数</h3>
            <div className="text-3xl font-bold text-green-400 mb-1">3,234.56</div>
            <div className="text-green-400">+39.87 (+1.25%)</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-2">深证成指</h3>
            <div className="text-3xl font-bold text-red-400 mb-1">12,345.67</div>
            <div className="text-red-400">-123.45 (-0.99%)</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-2">创业板指</h3>
            <div className="text-3xl font-bold text-green-400 mb-1">2,567.89</div>
            <div className="text-green-400">+45.23 (+1.79%)</div>
          </div>
        </div>

        {/* 排行榜区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* 涨幅排行榜 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">📈 涨幅排行</h3>
            <div className="space-y-3">
              {[
                { name: '贵州茅台', code: '600519', change: '+9.98%' },
                { name: '五粮液', code: '000858', change: '+8.76%' },
                { name: '招商银行', code: '600036', change: '+7.45%' },
                { name: '平安银行', code: '000001', change: '+6.23%' },
                { name: '万科A', code: '000002', change: '+5.67%' }
              ].map((stock, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <div className="text-white font-medium">{stock.name}</div>
                    <div className="text-gray-400 text-sm">{stock.code}</div>
                  </div>
                  <div className="text-green-400 font-semibold">{stock.change}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 成交量排行 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">📊 成交量排行</h3>
            <div className="space-y-3">
              {[
                { name: '中国平安', code: '601318', volume: '45.6亿' },
                { name: '招商银行', code: '600036', volume: '38.2亿' },
                { name: '贵州茅台', code: '600519', volume: '32.8亿' },
                { name: '五粮液', code: '000858', volume: '28.9亿' },
                { name: '万科A', code: '000002', volume: '25.4亿' }
              ].map((stock, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <div className="text-white font-medium">{stock.name}</div>
                    <div className="text-gray-400 text-sm">{stock.code}</div>
                  </div>
                  <div className="text-blue-400 font-semibold">{stock.volume}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 热门板块 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">🔥 热门板块</h3>
            <div className="space-y-3">
              {[
                { name: '人工智能', change: '+5.67%', count: '156只' },
                { name: '新能源汽车', change: '+4.23%', count: '89只' },
                { name: '半导体', change: '+3.89%', count: '234只' },
                { name: '生物医药', change: '+2.45%', count: '178只' },
                { name: '5G通信', change: '+1.98%', count: '145只' }
              ].map((sector, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <div className="text-white font-medium">{sector.name}</div>
                    <div className="text-gray-400 text-sm">{sector.count}</div>
                  </div>
                  <div className="text-green-400 font-semibold">{sector.change}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 财经资讯 */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">📰 财经资讯</h3>
          <div className="space-y-4">
            {[
              {
                title: '央行宣布降准0.5个百分点，释放流动性约1万亿元',
                time: '2小时前',
                source: '央行官网'
              },
              {
                title: 'A股三大指数集体高开，科技股领涨',
                time: '4小时前',
                source: '财经日报'
              },
              {
                title: '新能源汽车销量创新高，产业链公司受益',
                time: '6小时前',
                source: '行业研报'
              }
            ].map((news, index) => (
              <div key={index} className="border-b border-white/10 pb-3 last:border-b-0">
                <h4 className="text-white font-medium mb-2">{news.title}</h4>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{news.source}</span>
                  <span>{news.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
