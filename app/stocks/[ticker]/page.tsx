"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// 动态导入ECharts组件，避免SSR问题
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false })

type Row = {
  trade_date: string
  open_price: number
  high_price: number
  low_price: number
  close_price: number
  volume: number
}

type StockInfo = {
  ticker: string
  name: string
  market: string
  industry: string
  currentPrice: number
  changePercent: number
}

export default function StockDetailPage({ params }: { params: { ticker: string } }) {
  const { ticker } = params
  const [rows, setRows] = useState<Row[]>([])
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart')

  // 生成K线图配置
  const getKLineOption = () => {
    if (rows.length === 0) return {}

    const dates = rows.map(r => r.trade_date)
    const klineData = rows.map(r => [r.open_price, r.close_price, r.low_price, r.high_price])
    const volumeData = rows.map(r => r.volume)

    return {
      backgroundColor: 'transparent',
      title: {
        text: `${stockInfo?.name || ticker} K线图`,
        left: 'center',
        textStyle: { color: '#fff', fontSize: 18 }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderColor: '#777',
        textStyle: { color: '#fff' }
      },
      legend: {
        data: ['K线', '成交量'],
        textStyle: { color: '#fff' },
        top: 30
      },
      grid: [
        { left: '10%', right: '8%', height: '60%' },
        { left: '10%', right: '8%', top: '75%', height: '15%' }
      ],
      xAxis: [
        {
          type: 'category',
          data: dates,
          scale: true,
          boundaryGap: false,
          axisLine: { onZero: false, lineStyle: { color: '#777' } },
          splitLine: { show: false },
          splitNumber: 20,
          min: 'dataMin',
          max: 'dataMax',
          axisLabel: { color: '#fff' }
        },
        {
          type: 'category',
          gridIndex: 1,
          data: dates,
          scale: true,
          boundaryGap: false,
          axisLine: { onZero: false, lineStyle: { color: '#777' } },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          splitNumber: 20,
          min: 'dataMin',
          max: 'dataMax'
        }
      ],
      yAxis: [
        {
          scale: true,
          axisLine: { lineStyle: { color: '#777' } },
          splitLine: { lineStyle: { color: '#333' } },
          axisLabel: { color: '#fff' }
        },
        {
          scale: true,
          gridIndex: 1,
          splitNumber: 2,
          axisLabel: { show: false },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false }
        }
      ],
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0, 1],
          start: 50,
          end: 100
        },
        {
          show: true,
          xAxisIndex: [0, 1],
          type: 'slider',
          top: '90%',
          start: 50,
          end: 100,
          textStyle: { color: '#fff' }
        }
      ],
      series: [
        {
          name: 'K线',
          type: 'candlestick',
          data: klineData,
          itemStyle: {
            color: '#ef4444',
            color0: '#22c55e',
            borderColor: '#ef4444',
            borderColor0: '#22c55e'
          }
        },
        {
          name: '成交量',
          type: 'bar',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: volumeData,
          itemStyle: { color: '#3b82f6' }
        }
      ]
    }
  }

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const [{ data: info }, { data: k }] = await Promise.all([
          supabase.from('stocks_info').select('*').eq('ticker', ticker).maybeSingle(),
          supabase.from('stocks_daily')
            .select('trade_date,open_price,high_price,low_price,close_price,volume,turnover,pe_ratio,pb_ratio,market_cap')
            .eq('ticker', ticker)
            .order('trade_date', { ascending: false })
            .limit(120)
        ])

        if (info) {
          const latestData = k?.[0]
          const prevData = k?.[1]
          const changePercent = latestData && prevData ?
            ((latestData.close_price - prevData.close_price) / prevData.close_price * 100) : 0

          setStockInfo({
            ticker: info.ticker,
            name: info.name,
            market: info.market,
            industry: info.industry,
            currentPrice: latestData?.close_price || 0,
            changePercent: Number(changePercent.toFixed(2))
          })
        }
        setRows((k || []).reverse())
      } catch (e: any) {
        setError(e?.message || '加载失败')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [ticker])

  return (
    <div className="min-h-screen relative">
      {/* 粒子流背景 */}
      <div className="particle-background"></div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          {/* 头部信息 */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {stockInfo?.name || ticker} ({ticker})
              </h1>
              {stockInfo && (
                <div className="flex items-center space-x-4 text-lg">
                  <span className="text-white font-bold">
                    ¥{stockInfo.currentPrice.toFixed(2)}
                  </span>
                  <span className={`font-bold ${
                    stockInfo.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {stockInfo.changePercent >= 0 ? '+' : ''}{stockInfo.changePercent.toFixed(2)}%
                  </span>
                  <span className="text-gray-400">
                    {stockInfo.market} · {stockInfo.industry}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex bg-white/10 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('chart')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    viewMode === 'chart'
                      ? 'bg-primary text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  K线图
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    viewMode === 'table'
                      ? 'bg-primary text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  数据表
                </button>
              </div>
              <Link href="/" className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all">
                返回首页
              </Link>
            </div>
          </div>

          {/* 主要内容区域 */}
          {loading ? (
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center glass-card p-8">
                <div className="animate-spin w-12 h-12 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-xl font-medium text-foreground">正在加载股票数据...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center glass-card p-8">
                <div className="text-red-400 text-xl mb-4">⚠️ 加载失败</div>
                <p className="text-red-300">{error}</p>
              </div>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center glass-card p-8">
                <div className="text-gray-400 text-xl mb-4">📊 暂无数据</div>
                <p className="text-gray-300">该股票暂无历史数据</p>
              </div>
            </div>
          ) : (
            <div className="glass-card p-6">
              {viewMode === 'chart' ? (
                <div className="w-full h-[600px]">
                  <ReactECharts
                    option={getKLineOption()}
                    style={{ height: '100%', width: '100%' }}
                    opts={{ renderer: 'canvas' }}
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/20 text-gray-300">
                        <th className="py-3 px-2">日期</th>
                        <th className="py-3 px-2">开盘</th>
                        <th className="py-3 px-2">最高</th>
                        <th className="py-3 px-2">最低</th>
                        <th className="py-3 px-2">收盘</th>
                        <th className="py-3 px-2">成交量(万)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.slice().reverse().map((r, index) => {
                        const prevClose = index > 0 ? rows[rows.length - index].close_price : r.open_price
                        const changePercent = prevClose ? ((r.close_price - prevClose) / prevClose * 100) : 0
                        return (
                          <tr key={r.trade_date} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                            <td className="py-3 px-2 text-gray-300 font-mono">{r.trade_date}</td>
                            <td className="py-3 px-2 text-white">{r.open_price?.toFixed(2)}</td>
                            <td className="py-3 px-2 text-red-400">{r.high_price?.toFixed(2)}</td>
                            <td className="py-3 px-2 text-green-400">{r.low_price?.toFixed(2)}</td>
                            <td className={`py-3 px-2 font-bold ${
                              changePercent >= 0 ? 'text-red-400' : 'text-green-400'
                            }`}>
                              {r.close_price?.toFixed(2)}
                            </td>
                            <td className="py-3 px-2 text-gray-300">{(r.volume/10000).toFixed(1)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

