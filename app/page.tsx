'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { TrendingUp, BarChart3, Brain, Shield } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 导航栏 */}
      <nav className="glass border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <TrendingUp className="w-8 h-8 text-primary-400" />
            <span className="text-xl font-bold text-white">智能股票分析平台</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex space-x-4"
          >
            <Link href="/auth/login" className="btn-secondary">
              登录
            </Link>
            <Link href="/auth/register" className="btn-primary">
              注册
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="flex-1 flex flex-col justify-center items-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* 标题区域 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary-400 via-primary-300 to-accent-400 bg-clip-text text-transparent">
              新一代智能
              <br />
              股票分析平台
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              基于AI驱动的专业A股市场分析工具，提供策略选股、深度分析、智能预测等功能
            </p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/auth/register" className="btn-primary text-lg px-8 py-3 glow">
                立即开始分析
              </Link>
              <Link href="/demo" className="btn-secondary text-lg px-8 py-3">
                查看演示
              </Link>
            </motion.div>
          </motion.div>

          {/* 功能特色 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {[
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: "策略选股",
                description: "四大经典投资策略，智能筛选优质股票"
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "技术分析",
                description: "专业K线图表，多维度技术指标分析"
              },
              {
                icon: <Brain className="w-8 h-8" />,
                title: "AI分析",
                description: "Google Gemini Pro驱动的深度智能分析"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "数据安全",
                description: "企业级安全保障，个人数据严格隔离"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                className="card text-center group hover:glow transition-all duration-300"
              >
                <div className="text-primary-400 mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* 数据展示 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="card max-w-2xl mx-auto"
          >
            <h3 className="text-2xl font-bold mb-6 text-white">实时市场数据</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-400 mb-2">5000+</div>
                <div className="text-gray-400">A股标的</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-400 mb-2">99.9%</div>
                <div className="text-gray-400">数据准确率</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">&lt;1s</div>
                <div className="text-gray-400">响应时间</div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="glass border-t border-white/10 p-6 mt-16">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>&copy; 2025 智能股票分析平台. 专业投资分析工具.</p>
        </div>
      </footer>
    </div>
  )
}
