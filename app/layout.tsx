import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import TechBackground from '@/components/ui/TechBackground'
import AuthProvider from '@/components/auth/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '智能股票分析平台',
  description: '新一代智能股票分析平台 - 专业的A股市场策略选股与深度分析工具',
  keywords: '股票分析,A股,选股策略,技术分析,投资工具',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} min-h-screen bg-dark-900 text-gray-100`}>
        <TechBackground />
        <div className="relative z-10">
          <AuthProvider>
            {children}
          </AuthProvider>
        </div>
      </body>
    </html>
  )
}
