// 测试数据标识组件
// 文件路径: components/TestDataBadge.tsx

'use client'

import React from 'react'
import { AlertTriangle, Database, Zap } from 'lucide-react'

interface TestDataBadgeProps {
  isTestData?: boolean
  dataSource?: 'TEST' | 'API' | 'MANUAL'
  size?: 'sm' | 'md' | 'lg'
  position?: 'inline' | 'absolute'
  className?: string
}

const TestDataBadge: React.FC<TestDataBadgeProps> = ({
  isTestData = false,
  dataSource = 'API',
  size = 'sm',
  position = 'inline',
  className = ''
}) => {
  // 如果不是测试数据，不显示徽章
  if (!isTestData && dataSource !== 'TEST') {
    return null
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  }

  const positionClasses = {
    inline: 'inline-flex',
    absolute: 'absolute top-2 right-2'
  }

  const getIcon = () => {
    switch (dataSource) {
      case 'TEST':
        return <AlertTriangle className="w-3 h-3 mr-1" />
      case 'MANUAL':
        return <Database className="w-3 h-3 mr-1" />
      default:
        return <Zap className="w-3 h-3 mr-1" />
    }
  }

  const getBadgeText = () => {
    switch (dataSource) {
      case 'TEST':
        return '测试数据'
      case 'MANUAL':
        return '手动数据'
      default:
        return '实时数据'
    }
  }

  const getBadgeColor = () => {
    switch (dataSource) {
      case 'TEST':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'MANUAL':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      default:
        return 'bg-green-500/20 text-green-300 border-green-500/30'
    }
  }

  return (
    <span
      className={`
        ${positionClasses[position]}
        ${sizeClasses[size]}
        ${getBadgeColor()}
        items-center
        rounded-full
        border
        font-medium
        backdrop-blur-sm
        ${className}
      `}
    >
      {getIcon()}
      {getBadgeText()}
    </span>
  )
}

// 数据卡片包装组件，自动显示数据来源
interface DataCardProps {
  children: React.ReactNode
  isTestData?: boolean
  dataSource?: 'TEST' | 'API' | 'MANUAL'
  className?: string
  showBadge?: boolean
}

export const DataCard: React.FC<DataCardProps> = ({
  children,
  isTestData = false,
  dataSource = 'API',
  className = '',
  showBadge = true
}) => {
  return (
    <div className={`relative ${className}`}>
      {showBadge && (
        <TestDataBadge
          isTestData={isTestData}
          dataSource={dataSource}
          position="absolute"
          size="sm"
        />
      )}
      {children}
    </div>
  )
}

// 股票信息组件，带测试数据标识
interface StockInfoProps {
  ticker: string
  name: string
  price: number
  changePercent: number
  isTestData?: boolean
  dataSource?: 'TEST' | 'API' | 'MANUAL'
}

export const StockInfo: React.FC<StockInfoProps> = ({
  ticker,
  name,
  price,
  changePercent,
  isTestData = false,
  dataSource = 'API'
}) => {
  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400'
    if (change < 0) return 'text-red-400'
    return 'text-gray-400'
  }

  return (
    <DataCard
      isTestData={isTestData}
      dataSource={dataSource}
      className="glass-card p-4 hover:scale-105 transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">{name}</h3>
          <p className="text-gray-400 text-sm">{ticker}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-white">¥{price.toFixed(2)}</p>
          <p className={`text-sm font-semibold ${getChangeColor(changePercent)}`}>
            {changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%
          </p>
        </div>
      </div>
      
      {/* 测试数据警告 */}
      {isTestData && (
        <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center text-yellow-300 text-xs">
            <AlertTriangle className="w-3 h-3 mr-1" />
            此为演示数据，非实时行情
          </div>
        </div>
      )}
    </DataCard>
  )
}

// 市场指数组件，带测试数据标识
interface MarketIndexProps {
  indexName: string
  currentPrice: number
  changeAmount: number
  changePercent: number
  isTestData?: boolean
  dataSource?: 'TEST' | 'API' | 'MANUAL'
}

export const MarketIndex: React.FC<MarketIndexProps> = ({
  indexName,
  currentPrice,
  changeAmount,
  changePercent,
  isTestData = false,
  dataSource = 'API'
}) => {
  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400'
    if (change < 0) return 'text-red-400'
    return 'text-gray-400'
  }

  return (
    <DataCard
      isTestData={isTestData}
      dataSource={dataSource}
      className="glass-card p-6 text-center hover:scale-105 transition-all duration-300"
    >
      <h3 className="text-xl font-semibold text-gray-300 mb-4">
        {indexName}
      </h3>
      
      <div className="text-5xl font-bold text-white mb-4">
        {currentPrice.toFixed(2)}
      </div>
      
      <div className={`text-2xl font-semibold ${getChangeColor(changeAmount)}`}>
        {changeAmount > 0 ? '+' : ''}{changeAmount.toFixed(2)} 
        ({changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%)
      </div>
      
      {/* 测试数据警告 */}
      {isTestData && (
        <div className="mt-4 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center justify-center text-yellow-300 text-xs">
            <AlertTriangle className="w-3 h-3 mr-1" />
            演示数据
          </div>
        </div>
      )}
    </DataCard>
  )
}

export default TestDataBadge

/* 
使用示例：

// 1. 基础徽章
<TestDataBadge isTestData={true} dataSource="TEST" />

// 2. 股票信息卡片
<StockInfo
  ticker="000001"
  name="平安银行"
  price={12.34}
  changePercent={1.25}
  isTestData={true}
  dataSource="TEST"
/>

// 3. 市场指数卡片
<MarketIndex
  indexName="上证指数"
  currentPrice={3234.56}
  changeAmount={39.87}
  changePercent={1.25}
  isTestData={true}
  dataSource="TEST"
/>

// 4. 自定义数据卡片
<DataCard isTestData={true} dataSource="TEST">
  <div>您的自定义内容</div>
</DataCard>
*/
