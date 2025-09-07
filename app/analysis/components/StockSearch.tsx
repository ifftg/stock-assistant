'use client'

import React, { useState, useEffect, useRef } from 'react'

interface Stock {
  ticker: string
  name: string
  industry: string
  market: string
  price: number
  changePercent: number
}

interface StockSearchProps {
  onStockSelect: (stock: Stock) => void
  selectedStock: Stock | null
}

export default function StockSearch({ onStockSelect, selectedStock }: StockSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [stocks, setStocks] = useState<Stock[]>([])
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 获取股票列表
  useEffect(() => {
    const fetchStocks = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/stocks?includeTestData=true&limit=50')
        const data = await response.json()
        if (data.success) {
          setStocks(data.data)
        }
      } catch (error) {
        console.error('获取股票列表失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStocks()
  }, [])

  // 搜索过滤
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStocks([])
      setShowDropdown(false)
      return
    }

    const filtered = stocks.filter(stock => 
      stock.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      // 支持拼音搜索（简单实现）
      getPinyin(stock.name).toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    setFilteredStocks(filtered)
    setShowDropdown(filtered.length > 0)
  }, [searchTerm, stocks])

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 简单的拼音转换（仅支持常见汉字）
  const getPinyin = (text: string): string => {
    const pinyinMap: Record<string, string> = {
      '平安': 'pingan', '银行': 'yinhang', '万科': 'wanke',
      '五粮液': 'wuliangye', '招商': 'zhaoshang', 
      '贵州': 'guizhou', '茅台': 'maotai',
      '伊利': 'yili', '股份': 'gufen'
    }
    
    let pinyin = text
    Object.entries(pinyinMap).forEach(([chinese, py]) => {
      pinyin = pinyin.replace(new RegExp(chinese, 'g'), py)
    })
    return pinyin
  }

  const handleStockSelect = (stock: Stock) => {
    setSearchTerm(`${stock.ticker} ${stock.name}`)
    setShowDropdown(false)
    onStockSelect(stock)
  }

  const handleAnalyze = () => {
    if (selectedStock) {
      // 触发分析
      console.log('开始分析股票:', selectedStock)
      // 这里可以调用分析 API 或触发父组件的分析函数
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6">
      <h3 className="text-xl font-semibold text-white mb-4">股票搜索</h3>
      <div className="space-y-4" ref={dropdownRef}>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="输入股票代码或名称（支持拼音）..."
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            onFocus={() => searchTerm && setShowDropdown(filteredStocks.length > 0)}
          />
          
          {/* 下拉菜单 */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800/95 backdrop-blur-md border border-white/20 rounded-xl max-h-60 overflow-y-auto z-50">
              {filteredStocks.map((stock) => (
                <div
                  key={stock.ticker}
                  onClick={() => handleStockSelect(stock)}
                  className="px-4 py-3 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-b-0"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-white font-medium">{stock.name}</div>
                      <div className="text-gray-400 text-sm">{stock.ticker} · {stock.industry}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white">{stock.price.toFixed(2)}</div>
                      <div className={`text-sm ${stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <button 
          onClick={handleAnalyze}
          disabled={!selectedStock || loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '加载中...' : selectedStock ? `分析 ${selectedStock.name}` : '搜索分析'}
        </button>
        
        {/* 当前选中的股票信息 */}
        {selectedStock && (
          <div className="mt-4 p-3 bg-white/5 rounded-xl">
            <div className="text-white font-medium">{selectedStock.name}</div>
            <div className="text-gray-400 text-sm">{selectedStock.ticker} · {selectedStock.industry}</div>
            <div className="flex justify-between mt-2">
              <span className="text-white">{selectedStock.price.toFixed(2)}</span>
              <span className={`${selectedStock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
