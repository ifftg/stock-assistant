// 健康检查API
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '已设置' : '未设置',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已设置' : '未设置',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '已设置' : '未设置',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '已设置' : '未设置',
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL ? '是' : '否'
    }

    return NextResponse.json({
      success: true,
      message: '服务正常运行',
      timestamp: new Date().toISOString(),
      environment: envCheck
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
