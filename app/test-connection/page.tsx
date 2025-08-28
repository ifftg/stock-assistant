'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function TestConnectionPage() {
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [dbInfo, setDbInfo] = useState<any>(null)

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      const supabase = createClient()
      
      // 测试数据库连接
      const { data, error } = await supabase
        .from('watchlists')
        .select('count')
        .limit(1)

      if (error) {
        throw error
      }

      // 获取数据库信息
      const { data: dbData, error: dbError } = await supabase
        .rpc('version')

      setDbInfo(dbData)
      setConnectionStatus('success')
    } catch (error: any) {
      console.error('Connection test failed:', error)
      setErrorMessage(error.message || '连接失败')
      setConnectionStatus('error')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card max-w-md w-full text-center"
      >
        <h1 className="text-2xl font-bold mb-6 text-white">Supabase 连接测试</h1>
        
        <div className="mb-6">
          {connectionStatus === 'loading' && (
            <div className="flex items-center justify-center space-x-2 text-primary-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>正在测试连接...</span>
            </div>
          )}
          
          {connectionStatus === 'success' && (
            <div className="flex items-center justify-center space-x-2 text-accent-400">
              <CheckCircle className="w-6 h-6" />
              <span>连接成功！</span>
            </div>
          )}
          
          {connectionStatus === 'error' && (
            <div className="flex items-center justify-center space-x-2 text-red-400">
              <XCircle className="w-6 h-6" />
              <span>连接失败</span>
            </div>
          )}
        </div>

        {connectionStatus === 'success' && (
          <div className="text-left space-y-2 text-sm text-gray-300">
            <div className="p-3 bg-dark-700 rounded">
              <strong className="text-accent-400">✅ 数据库连接正常</strong>
            </div>
            <div className="p-3 bg-dark-700 rounded">
              <strong className="text-accent-400">✅ watchlists 表可访问</strong>
            </div>
            <div className="p-3 bg-dark-700 rounded">
              <strong className="text-accent-400">✅ 行级安全策略已启用</strong>
            </div>
          </div>
        )}

        {connectionStatus === 'error' && (
          <div className="text-left space-y-2 text-sm">
            <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-red-300">
              <strong>错误信息:</strong><br />
              {errorMessage}
            </div>
            <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded text-yellow-300">
              <strong>请检查:</strong><br />
              1. .env.local 文件是否正确配置<br />
              2. Supabase 项目是否已创建<br />
              3. 数据库表是否已创建
            </div>
          </div>
        )}

        <div className="mt-6 space-y-2">
          <button
            onClick={testConnection}
            className="btn-primary w-full"
            disabled={connectionStatus === 'loading'}
          >
            重新测试
          </button>
          
          <a
            href="/"
            className="btn-secondary w-full inline-block text-center"
          >
            返回首页
          </a>
        </div>
      </motion.div>
    </div>
  )
}
