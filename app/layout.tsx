import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '智能股票分析平台',
  description: '实时数据 · 智能分析 · 精准决策',
  keywords: '股票分析,AI分析,实时数据,投资决策',
  authors: [{ name: '智能股票分析平台' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <main>{children}</main>
      </body>
    </html>
  )
}
