import React from 'react'

export default function QuantPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            ⚡ 量化工作台
          </h1>
          <p className="text-xl text-gray-300">
            专业回测平台 · 策略验证工具
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* 策略参数面板 */}
          <div className="xl:col-span-1">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">策略参数</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">选择策略</label>
                  <select className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400">
                    <option value="">选择策略...</option>
                    <option value="ma">均线策略</option>
                    <option value="macd">MACD策略</option>
                    <option value="rsi">RSI策略</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm mb-2">股票代码</label>
                  <input
                    type="text"
                    placeholder="000001"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">回测周期</label>
                  <select className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400">
                    <option value="1y">1年</option>
                    <option value="2y">2年</option>
                    <option value="3y">3年</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">初始资金</label>
                  <input
                    type="number"
                    placeholder="100000"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  />
                </div>

                <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300">
                  开始回测
                </button>
              </div>
            </div>

            {/* 技术指标 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">技术指标</h3>
              <div className="space-y-3">
                {[
                  { name: 'MACD', value: '0.23', status: 'bullish' },
                  { name: 'RSI', value: '67.8', status: 'neutral' },
                  { name: 'KDJ', value: '45.2', status: 'bearish' },
                  { name: 'BOLL', value: '上轨', status: 'bullish' }
                ].map((indicator, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <span className="text-white font-medium">{indicator.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-300">{indicator.value}</span>
                      <div className={`w-3 h-3 rounded-full ${
                        indicator.status === 'bullish' ? 'bg-green-400' :
                        indicator.status === 'bearish' ? 'bg-red-400' : 'bg-yellow-400'
                      }`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* K线图表区域 */}
          <div className="xl:col-span-2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 h-96">
              <h3 className="text-xl font-semibold text-white mb-4">K线图表</h3>
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">📈</div>
                  <p>K线图表将在这里显示</p>
                  <p className="text-sm mt-2">请配置策略参数后开始回测</p>
                </div>
              </div>
            </div>
          </div>

          {/* 回测结果 */}
          <div className="xl:col-span-1">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">回测结果</h3>
              <div className="space-y-4">
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">总收益率</div>
                  <div className="text-green-400 text-2xl font-bold">--</div>
                </div>
                
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">年化收益</div>
                  <div className="text-white text-xl font-bold">--</div>
                </div>
                
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">最大回撤</div>
                  <div className="text-red-400 text-xl font-bold">--</div>
                </div>
                
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">夏普比率</div>
                  <div className="text-white text-xl font-bold">--</div>
                </div>
                
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">胜率</div>
                  <div className="text-white text-xl font-bold">--</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 交易信号时间轴 */}
        <div className="mt-6 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">交易信号</h3>
          <div className="text-center text-gray-400 py-8">
            <div className="text-4xl mb-4">📊</div>
            <p>交易信号时间轴将在回测完成后显示</p>
          </div>
        </div>
      </div>
    </div>
  )
}
