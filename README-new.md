# 智能股票分析平台

基于Next.js和Supabase的现代化股票分析平台，提供实时数据展示和AI智能分析功能。

## 🚀 快速开始

### Vercel一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/smart-stock-platform)

### 环境变量配置

在Vercel中配置以下环境变量：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 数据库初始化

在Supabase SQL编辑器中执行 `database-setup-simple.sql` 脚本。

## ✨ 功能特性

- 📊 **实时市场数据** - 股票价格、指数、成交量
- 🤖 **AI智能分析** - 技术分析、基本面分析
- ⭐ **自选股管理** - 个人投资组合跟踪
- 📰 **财经资讯** - 实时新闻和市场动态
- 📱 **响应式设计** - 完美适配移动端

## 🛠 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **数据库**: Supabase (PostgreSQL)
- **部署**: Vercel
- **UI组件**: Radix UI + shadcn/ui

## 📁 项目结构

```
├── app/                    # Next.js App Router
│   ├── api/               # API路由 (后端)
│   │   ├── stocks/        # 股票数据API
│   │   └── market-indices/ # 市场指数API
│   ├── page.tsx           # 首页 (前端)
│   ├── layout.tsx         # 根布局
│   └── globals.css        # 全局样式
├── components/            # React组件
│   └── ui/               # UI组件库
├── lib/                  # 工具函数
├── database-setup-simple.sql # 数据库脚本
└── package.json          # 项目配置
```

## 🔧 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 📊 数据库设计

- `stocks_info` - 股票基础信息
- `stocks_daily` - 日线数据
- `market_indices` - 市场指数
- `watchlists` - 用户自选股
- `ai_analyses` - AI分析结果
- `financial_news` - 财经新闻
- `concept_sectors` - 概念板块

## 🚀 部署说明

1. **推送代码到GitHub**
2. **连接Vercel** - 导入GitHub仓库
3. **配置环境变量** - 添加Supabase配置
4. **自动部署** - Vercel自动构建和部署

## 📝 许可证

MIT License
