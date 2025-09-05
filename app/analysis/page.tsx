export default function AnalysisPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🔍 个股AI分析
          </h1>
          <p className="text-xl text-gray-300">
            智能分析工具 · AI驱动决策
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 股票搜索区域 */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">股票搜索</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="输入股票代码或名称..."
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                />
                <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300">
                  搜索分析
                </button>
              </div>
            </div>

            {/* 自选股列表 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">我的自选股</h3>
              <div className="space-y-3">
                {[
                  { code: '000001', name: '平安银行', price: '12.34', change: '+2.45%' },
                  { code: '600519', name: '贵州茅台', price: '1678.90', change: '+1.23%' },
                  { code: '000858', name: '五粮液', price: '156.78', change: '-0.89%' },
                  { code: '600036', name: '招商银行', price: '34.56', change: '+3.21%' }
                ].map((stock, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-200 cursor-pointer">
                    <div>
                      <div className="text-white font-medium">{stock.name}</div>
                      <div className="text-gray-400 text-sm">{stock.code}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white">{stock.price}</div>
                      <div className={`text-sm ${stock.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                        {stock.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 分析结果区域 */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">AI智能分析</h3>
              <div className="text-center text-gray-400 py-12">
                <div className="text-6xl mb-4">🤖</div>
                <p className="text-lg mb-2">请选择股票开始AI分析</p>
                <p className="text-sm">今日剩余分析次数：5次</p>
              </div>
            </div>

            {/* 专业指标仪表盘 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">专业指标</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">PE比率</div>
                  <div className="text-white text-xl font-bold">--</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">PB比率</div>
                  <div className="text-white text-xl font-bold">--</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">ROE</div>
                  <div className="text-white text-xl font-bold">--</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">市值</div>
                  <div className="text-white text-xl font-bold">--</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
