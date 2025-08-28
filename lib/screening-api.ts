// 策略选股API服务

export interface ScreeningRequest {
  strategy: 'value_investing' | 'growth' | 'momentum' | 'contrarian'
  limit?: number
}

export interface ScreeningResult {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  turnover: number
  marketCap: number
  pe?: number | null
  pb?: number | null
  turnoverRate: number
  volumeRatio: number
  strategy: string
  score: number
  lastUpdate: number
}

export interface ScreeningResponse {
  success: boolean
  strategy: string
  count: number
  results: ScreeningResult[]
  timestamp: number
  error?: string
}

// 策略描述
export const STRATEGY_DESCRIPTIONS = {
  value_investing: {
    name: '价值投资',
    description: '寻找低估值、高分红的优质股票',
    criteria: ['PE < 20', 'PB < 3', '市值 > 100亿', '财务稳健'],
    color: 'blue'
  },
  growth: {
    name: '成长股',
    description: '挖掘高成长潜力的新兴企业',
    criteria: ['营收增长 > 20%', 'ROE > 15%', '行业前景好', '估值合理'],
    color: 'green'
  },
  momentum: {
    name: '动量策略',
    description: '捕捉强势上涨的热门股票',
    criteria: ['涨幅 > 2%', '量比 > 1.5', '换手率 > 2%', '技术突破'],
    color: 'red'
  },
  contrarian: {
    name: '逆向投资',
    description: '发现超跌反弹的投资机会',
    criteria: ['跌幅 2-8%', '量比 > 1.2', 'PE < 30', '基本面良好'],
    color: 'purple'
  }
}

/**
 * 执行策略选股
 */
export async function screenStocks(request: ScreeningRequest): Promise<ScreeningResponse> {
  try {
    const response = await fetch('/api/screen', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        strategy: request.strategy,
        limit: request.limit || 20
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.success) {
      return data
    } else {
      throw new Error(data.error || '策略选股失败')
    }
  } catch (error) {
    console.error('策略选股API调用失败:', error)
    
    // 返回错误响应
    return {
      success: false,
      strategy: request.strategy,
      count: 0,
      results: [],
      timestamp: Date.now(),
      error: error instanceof Error ? error.message : '未知错误'
    }
  }
}

/**
 * 获取所有策略的选股结果
 */
export async function getAllStrategiesResults(limit: number = 10): Promise<Record<string, ScreeningResponse>> {
  const strategies: Array<ScreeningRequest['strategy']> = ['value_investing', 'growth', 'momentum', 'contrarian']
  
  const promises = strategies.map(strategy => 
    screenStocks({ strategy, limit })
  )
  
  try {
    const results = await Promise.all(promises)
    
    const resultMap: Record<string, ScreeningResponse> = {}
    strategies.forEach((strategy, index) => {
      resultMap[strategy] = results[index]
    })
    
    return resultMap
  } catch (error) {
    console.error('批量获取策略结果失败:', error)
    
    // 返回空结果
    const emptyResults: Record<string, ScreeningResponse> = {}
    strategies.forEach(strategy => {
      emptyResults[strategy] = {
        success: false,
        strategy,
        count: 0,
        results: [],
        timestamp: Date.now(),
        error: '获取失败'
      }
    })
    
    return emptyResults
  }
}

/**
 * 格式化策略结果用于显示
 */
export function formatStrategyResult(result: ScreeningResult): {
  displayName: string
  displayPrice: string
  displayChange: string
  displayVolume: string
  displayMarketCap: string
  displayPE: string
  displayPB: string
  changeColor: string
} {
  return {
    displayName: `${result.symbol} ${result.name}`,
    displayPrice: `¥${result.price.toFixed(2)}`,
    displayChange: `${result.change >= 0 ? '+' : ''}${result.change.toFixed(2)} (${result.changePercent >= 0 ? '+' : ''}${result.changePercent.toFixed(2)}%)`,
    displayVolume: formatVolume(result.volume),
    displayMarketCap: formatMarketCap(result.marketCap),
    displayPE: result.pe ? result.pe.toFixed(2) : '--',
    displayPB: result.pb ? result.pb.toFixed(2) : '--',
    changeColor: result.change >= 0 ? 'text-green-400' : 'text-red-400'
  }
}

/**
 * 格式化成交量
 */
function formatVolume(volume: number): string {
  if (volume >= 100000000) {
    return `${(volume / 100000000).toFixed(1)}亿`
  } else if (volume >= 10000) {
    return `${(volume / 10000).toFixed(1)}万`
  } else {
    return volume.toString()
  }
}

/**
 * 格式化市值
 */
function formatMarketCap(marketCap: number): string {
  if (marketCap >= 100000000000) {
    return `${(marketCap / 100000000000).toFixed(0)}千亿`
  } else if (marketCap >= 1000000000) {
    return `${(marketCap / 1000000000).toFixed(0)}亿`
  } else if (marketCap >= 100000000) {
    return `${(marketCap / 100000000).toFixed(1)}亿`
  } else {
    return `${(marketCap / 10000).toFixed(0)}万`
  }
}

/**
 * 获取策略颜色主题
 */
export function getStrategyTheme(strategy: string) {
  const themes = {
    value_investing: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-400',
      button: 'bg-blue-600 hover:bg-blue-700'
    },
    growth: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      text: 'text-green-400',
      button: 'bg-green-600 hover:bg-green-700'
    },
    momentum: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      text: 'text-red-400',
      button: 'bg-red-600 hover:bg-red-700'
    },
    contrarian: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      text: 'text-purple-400',
      button: 'bg-purple-600 hover:bg-purple-700'
    }
  }
  
  return themes[strategy as keyof typeof themes] || themes.value_investing
}
