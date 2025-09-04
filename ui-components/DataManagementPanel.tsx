// 数据管理面板组件
// 文件路径: components/DataManagementPanel.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Trash2,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react'

interface DataStatus {
  tableName: string
  testCount: number
  totalCount: number
  status: 'test' | 'production' | 'mixed'
}

const DataManagementPanel: React.FC = () => {
  const [dataStatus, setDataStatus] = useState<DataStatus[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showPanel, setShowPanel] = useState(false)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  // 模拟数据状态检查
  const checkDataStatus = async () => {
    setIsLoading(true)
    try {
      // 这里应该调用实际的API检查数据状态
      // const response = await fetch('/api/data-status')
      // const data = await response.json()
      
      // 模拟数据
      const mockData: DataStatus[] = [
        { tableName: 'stocks_info', testCount: 5, totalCount: 5, status: 'test' },
        { tableName: 'stocks_daily', testCount: 5, totalCount: 5, status: 'test' },
        { tableName: 'market_indices', testCount: 3, totalCount: 3, status: 'test' },
        { tableName: 'financial_news', testCount: 0, totalCount: 3, status: 'production' },
        { tableName: 'concept_sectors', testCount: 0, totalCount: 5, status: 'production' }
      ]
      
      setDataStatus(mockData)
      setLastCheck(new Date())
    } catch (error) {
      console.error('检查数据状态失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 清理测试数据
  const cleanTestData = async () => {
    if (!confirm('确定要清理所有测试数据吗？此操作不可撤销！')) {
      return
    }
    
    setIsLoading(true)
    try {
      // 这里应该调用实际的API清理测试数据
      // const response = await fetch('/api/clean-test-data', { method: 'POST' })
      // const result = await response.json()
      
      console.log('清理测试数据...')
      await new Promise(resolve => setTimeout(resolve, 2000)) // 模拟API调用
      
      // 重新检查状态
      await checkDataStatus()
      alert('测试数据清理完成！')
    } catch (error) {
      console.error('清理测试数据失败:', error)
      alert('清理失败，请检查网络连接')
    } finally {
      setIsLoading(false)
    }
  }

  // 切换到生产模式
  const switchToProduction = async () => {
    if (!confirm('确定要切换到生产模式吗？这将清理所有测试数据并启用实时数据源。')) {
      return
    }
    
    setIsLoading(true)
    try {
      // 这里应该调用实际的API切换到生产模式
      // const response = await fetch('/api/switch-to-production', { method: 'POST' })
      // const result = await response.json()
      
      console.log('切换到生产模式...')
      await new Promise(resolve => setTimeout(resolve, 3000)) // 模拟API调用
      
      // 重新检查状态
      await checkDataStatus()
      alert('已切换到生产模式！')
    } catch (error) {
      console.error('切换到生产模式失败:', error)
      alert('切换失败，请检查网络连接')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkDataStatus()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'test':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case 'production':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'mixed':
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return <Database className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'test':
        return '测试数据'
      case 'production':
        return '生产数据'
      case 'mixed':
        return '混合数据'
      default:
        return '未知状态'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'test':
        return 'text-yellow-400'
      case 'production':
        return 'text-green-400'
      case 'mixed':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const hasTestData = dataStatus.some(item => item.testCount > 0)

  return (
    <>
      {/* 浮动按钮 */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300"
        title="数据管理"
      >
        {showPanel ? <EyeOff className="w-6 h-6" /> : <Settings className="w-6 h-6" />}
      </button>

      {/* 数据管理面板 */}
      {showPanel && (
        <div className="fixed bottom-20 right-6 z-40 w-96 bg-slate-800 border border-slate-600 rounded-lg shadow-xl">
          <div className="p-4 border-b border-slate-600">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Database className="w-5 h-5 mr-2" />
                数据管理
              </h3>
              <button
                onClick={checkDataStatus}
                disabled={isLoading}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title="刷新状态"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            {lastCheck && (
              <p className="text-xs text-gray-400 mt-1">
                最后检查: {lastCheck.toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="p-4 max-h-64 overflow-y-auto">
            <h4 className="text-sm font-medium text-gray-300 mb-3">数据表状态</h4>
            <div className="space-y-2">
              {dataStatus.map((item) => (
                <div key={item.tableName} className="flex items-center justify-between p-2 bg-slate-700 rounded">
                  <div className="flex items-center">
                    {getStatusIcon(item.status)}
                    <span className="text-sm text-white ml-2">{item.tableName}</span>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs ${getStatusColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {item.testCount}/{item.totalCount}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {hasTestData && (
            <div className="p-4 border-t border-slate-600 bg-yellow-500/10">
              <div className="flex items-center text-yellow-300 text-sm mb-3">
                <AlertTriangle className="w-4 h-4 mr-2" />
                检测到测试数据
              </div>
              <div className="space-y-2">
                <button
                  onClick={cleanTestData}
                  disabled={isLoading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white text-sm py-2 px-3 rounded flex items-center justify-center transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  清理测试数据
                </button>
                <button
                  onClick={switchToProduction}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white text-sm py-2 px-3 rounded flex items-center justify-center transition-colors"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  切换生产模式
                </button>
              </div>
            </div>
          )}

          {!hasTestData && (
            <div className="p-4 border-t border-slate-600 bg-green-500/10">
              <div className="flex items-center text-green-300 text-sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                生产模式已激活
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default DataManagementPanel

/* 
使用方法：
1. 将此组件添加到应用的根布局中
2. 在开发环境中显示，生产环境中隐藏
3. 提供数据状态检查和管理功能

在 layout.tsx 中使用：
import DataManagementPanel from '@/components/DataManagementPanel'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>
        {children}
        {process.env.NODE_ENV === 'development' && <DataManagementPanel />}
      </body>
    </html>
  )
}

API端点需要实现：
- GET /api/data-status - 检查数据状态
- POST /api/clean-test-data - 清理测试数据
- POST /api/switch-to-production - 切换到生产模式
*/
