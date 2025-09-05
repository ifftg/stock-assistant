export default function StrategiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">🎯 策略选股</h1>
          <p className="text-xl text-gray-300">智能策略筛选 · 精准选股工具</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-blue-400/50 transition-all duration-300">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">💎</div>
              <h3 className="text-xl font-semibold text-white">经典价值策略</h3>
            </div>
            <div className="space-y-2 mb-6">
              <div className="text-gray-300">• PE &lt; 15</div>
              <div className="text-gray-300">• PB &lt; 1.5</div>
              <div className="text-gray-300">• 市值 &gt; 200亿</div>
            </div>
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-green-400">23只</div>
              <div className="text-sm text-gray-400">符合条件股票</div>
            </div>
            <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
              开始筛选
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-blue-400/50 transition-all duration-300">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">📈</div>
              <h3 className="text-xl font-semibold text-white">放量上涨策略</h3>
            </div>
            <div className="space-y-2 mb-6">
              <div className="text-gray-300">• 成交量/5日均量 ≥ 2</div>
              <div className="text-gray-300">• 成交额 ≥ 2亿</div>
              <div className="text-gray-300">• 当日涨幅 &gt; 3%</div>
            </div>
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-green-400">45只</div>
              <div className="text-sm text-gray-400">符合条件股票</div>
            </div>
            <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
              开始筛选
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-blue-400/50 transition-all duration-300">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">📊</div>
              <h3 className="text-xl font-semibold text-white">均线多头策略</h3>
            </div>
            <div className="space-y-2 mb-6">
              <div className="text-gray-300">• MA5 &gt; MA10 &gt; MA20</div>
              <div className="text-gray-300">• 均线向上发散</div>
              <div className="text-gray-300">• 价格在均线之上</div>
            </div>
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-green-400">67只</div>
              <div className="text-sm text-gray-400">符合条件股票</div>
            </div>
            <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
              开始筛选
            </button>
          </div>
        </div>

        <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">筛选结果</h3>
          <div className="text-center text-gray-400 py-8">
            <div className="text-4xl mb-4">🔍</div>
            <p>请选择上方策略开始筛选股票</p>
          </div>
        </div>
      </div>
    </div>
  )
}

