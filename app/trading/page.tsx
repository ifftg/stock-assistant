export default function TradingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-500 mb-4">
            💼 交易系统
          </h1>
          <p className="text-xl text-gray-500">
            功能开发中 · 敬请期待
          </p>
        </div>

        {/* 未开放提示 */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-center">
            <div className="text-8xl mb-6 opacity-50">🚧</div>
            <h2 className="text-2xl font-bold text-gray-400 mb-4">功能暂未开放</h2>
            <p className="text-gray-500 mb-6 leading-relaxed">
              交易系统功能正在开发中，将包含模拟交易、实盘对接、风险控制等功能。
              <br />
              请先体验其他功能模块，我们会尽快上线交易功能。
            </p>
            
            {/* 预期功能展示 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-3xl mb-2 opacity-50">📱</div>
                <h3 className="text-gray-400 font-semibold mb-2">模拟交易</h3>
                <p className="text-gray-500 text-sm">虚拟资金练手，零风险体验</p>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-3xl mb-2 opacity-50">🔗</div>
                <h3 className="text-gray-400 font-semibold mb-2">实盘对接</h3>
                <p className="text-gray-500 text-sm">连接券商接口，真实交易</p>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-3xl mb-2 opacity-50">⚠️</div>
                <h3 className="text-gray-400 font-semibold mb-2">风险控制</h3>
                <p className="text-gray-500 text-sm">智能止损，资金保护</p>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-3xl mb-2 opacity-50">📊</div>
                <h3 className="text-gray-400 font-semibold mb-2">交易分析</h3>
                <p className="text-gray-500 text-sm">交易记录，绩效分析</p>
              </div>
            </div>

            {/* 返回其他功能的快捷链接 */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-gray-500 mb-4">您可以先体验其他功能：</p>
              <div className="flex flex-wrap justify-center gap-3">
                <a 
                  href="/" 
                  className="px-4 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-all duration-300"
                >
                  🏠 市场行情
                </a>
                <a 
                  href="/strategies" 
                  className="px-4 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-all duration-300"
                >
                  🎯 策略选股
                </a>
                <a 
                  href="/analysis" 
                  className="px-4 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-all duration-300"
                >
                  🔍 AI分析
                </a>
                <a 
                  href="/quant" 
                  className="px-4 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-all duration-300"
                >
                  ⚡ 量化工作台
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
