import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 格式化数字显示
export function formatNumber(num: number, decimals: number = 2): string {
  if (num >= 1e8) return (num / 1e8).toFixed(decimals) + '亿'
  if (num >= 1e4) return (num / 1e4).toFixed(decimals) + '万'
  return num.toFixed(decimals)
}

// 格式化百分比
export function formatPercent(num: number, decimals: number = 2): string {
  const sign = num >= 0 ? '+' : ''
  return `${sign}${num.toFixed(decimals)}%`
}

// 格式化价格
export function formatPrice(price: number, currency: string = '¥'): string {
  return `${currency}${price.toFixed(2)}`
}

// 判断是否为交易时间
export function isTradingTime(): boolean {
  const now = new Date()
  const hour = now.getHours()
  const minute = now.getMinutes()
  const day = now.getDay()
  
  // 周末不交易
  if (day === 0 || day === 6) return false
  
  // 上午 9:30-11:30
  if (hour === 9 && minute >= 30) return true
  if (hour === 10) return true
  if (hour === 11 && minute <= 30) return true
  
  // 下午 13:00-15:00
  if (hour === 13) return true
  if (hour === 14) return true
  if (hour === 15 && minute === 0) return true
  
  return false
}

// 获取交易状态文本
export function getTradingStatus(): string {
  if (isTradingTime()) {
    return '交易中'
  }
  
  const now = new Date()
  const hour = now.getHours()
  const day = now.getDay()
  
  if (day === 0 || day === 6) {
    return '休市'
  }
  
  if (hour < 9 || (hour === 9 && now.getMinutes() < 30)) {
    return '开盘前'
  }
  
  if (hour > 15) {
    return '收盘后'
  }
  
  if (hour >= 11 && hour < 13) {
    return '午休'
  }
  
  return '非交易时间'
}

// 颜色工具函数
export function getChangeColor(change: number): string {
  if (change > 0) return 'text-green-600'
  if (change < 0) return 'text-red-600'
  return 'text-gray-600'
}

// 延迟函数
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
