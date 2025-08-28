# 🚀 智能股票分析平台

新一代智能股票分析平台 - 专业的A股市场策略选股与深度分析工具

## ✨ 功能特色

- 🎯 **策略选股**: 四大经典投资策略智能筛选
- 📊 **技术分析**: 专业K线图表与技术指标
- 🤖 **AI分析**: Google Gemini Pro驱动的深度分析
- 🔒 **数据安全**: 企业级安全保障，数据严格隔离
- 🎨 **科技感UI**: 动态粒子背景，现代化交互体验

## 🛠️ 技术栈

- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **后端**: Vercel Serverless Functions (Python)
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **AI**: Google Gemini Pro
- **图表**: Apache ECharts
- **动画**: Framer Motion

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

复制 `.env.local.example` 为 `.env.local` 并填入以下配置：

```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini API配置
GOOGLE_API_KEY=your_google_gemini_api_key
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📋 配置指南

### Supabase 配置步骤

1. 访问 [Supabase](https://supabase.com) 并创建新项目
2. 在项目设置中找到API配置：
   - `Project URL` → 复制到 `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → 复制到 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Google Gemini API 配置

1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 创建新的API密钥
3. 复制密钥到 `GOOGLE_API_KEY`

### Vercel 部署配置

1. 将代码推送到GitHub仓库
2. 在 [Vercel](https://vercel.com) 中导入项目
3. 在Environment Variables中添加所有环境变量
4. 部署完成后，Vercel会自动为每次push触发重新部署

## 📁 项目结构

```
├── app/                    # Next.js App Router
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React组件
│   └── ui/               # UI组件
│       └── TechBackground.tsx  # 科技感背景
├── .env.local.example    # 环境变量示例
├── next.config.js        # Next.js配置
├── tailwind.config.js    # Tailwind配置
└── package.json          # 项目依赖
```

## 🎨 设计特色

### 科技感动态背景
- 粒子连线动画
- 网格背景效果
- 浮动光点动画
- 脉冲圆环效果
- 玻璃态毛玻璃效果

### 配色方案
- **主色调**: 科技蓝 (#0ea5e9)
- **辅助色**: 翠绿色 (#22c55e)
- **背景色**: 深色系 (#0f172a)
- **强调色**: 渐变效果

## 📝 开发计划

- [x] 项目初始化与环境搭建
- [ ] Supabase数据库配置
- [ ] 用户认证系统开发
- [ ] 主仪表盘布局设计
- [ ] 股票策略选股功能
- [ ] 个股查询与K线图展示
- [ ] AI智能分析功能
- [ ] 自选股管理功能
- [ ] 科技感UI设计与优化
- [ ] 测试与部署优化

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。
