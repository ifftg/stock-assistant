"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

type Row = {
  trade_date: string
  open_price: number
  high_price: number
  low_price: number
  close_price: number
  volume: number
}

export default function StockDetailPage({ params }: { params: { ticker: string } }) {
  const { ticker } = params
  const [rows, setRows] = useState<Row[]>([])
  const [name, setName] = useState<string>(ticker)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const [{ data: info }, { data: k }] = await Promise.all([
          supabase.from('stocks_info').select('name').eq('ticker', ticker).maybeSingle(),
          supabase.from('stocks_daily')
            .select('trade_date,open_price,high_price,low_price,close_price,volume')
            .eq('ticker', ticker)
            .order('trade_date', { ascending: false })
            .limit(60)
        ])
        if (info?.name) setName(info.name)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{name} ({ticker})</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300">返回首页</Link>
        </div>

        {loading ? (
          <div className="text-gray-300">加载中...</div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : rows.length === 0 ? (
          <div className="text-gray-300">暂无数据</div>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/20 text-gray-300">
                    <th className="py-2">日期</th>
                    <th className="py-2">开</th>
                    <th className="py-2">高</th>
                    <th className="py-2">低</th>
                    <th className="py-2">收</th>
                    <th className="py-2">量(万)</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.trade_date} className="border-b border-white/10">
                      <td className="py-2 text-gray-300">{r.trade_date}</td>
                      <td className="py-2">{r.open_price?.toFixed(2)}</td>
                      <td className="py-2">{r.high_price?.toFixed(2)}</td>
                      <td className="py-2">{r.low_price?.toFixed(2)}</td>
                      <td className="py-2">{r.close_price?.toFixed(2)}</td>
                      <td className="py-2 text-gray-300">{(r.volume/10000).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

