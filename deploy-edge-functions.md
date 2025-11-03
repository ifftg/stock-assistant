# 部署Edge Functions到Supabase指南

## 📋 需要部署的Edge Functions

### 1. stock-data-fetcher (股票数据获取器)
**文件**: `stock-data-fetcher-edge-function.ts`
**功能**: 从东方财富API获取股票数据并存储到数据库

### 2. ai-analysis (AI股票分析) 
**文件**: `ai-analysis-edge-function.ts`
**功能**: 使用Gemini AI分析股票并提供投资建议

## 🚀 部署步骤

### 方法1: 通过Supabase Dashboard部署

1. **登录Supabase Dashboard**
   - 访问: https://supabase.com/dashboard
   - 选择您的项目

2. **创建stock-data-fetcher函数**
   - 进入 `Edge Functions` 页面
   - 点击 `Create a new function`
   - 函数名: `stock-data-fetcher`
   - 将 `stock-data-fetcher-edge-function.ts` 的内容复制到编辑器
   - 点击 `Deploy function`

3. **创建ai-analysis函数**
   - 点击 `Create a new function`
   - 函数名: `ai-analysis`
   - 将 `ai-analysis-edge-function.ts` 的内容复制到编辑器
   - 点击 `Deploy function`

### 方法2: 通过Supabase CLI部署

```bash
# 1. 初始化Supabase项目
supabase init

# 2. 链接到远程项目
supabase link --project-ref YOUR_PROJECT_REF

# 3. 创建函数目录结构
mkdir -p supabase/functions/stock-data-fetcher
mkdir -p supabase/functions/ai-analysis

# 4. 复制函数文件
cp stock-data-fetcher-edge-function.ts supabase/functions/stock-data-fetcher/index.ts
cp ai-analysis-edge-function.ts supabase/functions/ai-analysis/index.ts

# 5. 部署函数
supabase functions deploy stock-data-fetcher
supabase functions deploy ai-analysis
```

## 🔧 环境变量配置

在Supabase Dashboard的 `Settings > Edge Functions` 中配置以下环境变量：

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

## 📡 API调用示例

### 1. 获取股票列表数据
```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/stock-data-fetcher' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "action": "fetch_stock_list",
    "page_size": 100
  }'
```

### 2. 获取单只股票历史数据
```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/stock-data-fetcher' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "action": "fetch_stock_history",
    "ticker": "000001",
    "days": 30
  }'
```

### 3. AI股票分析
```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/ai-analysis' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "ticker": "000001",
    "user_id": "user_uuid",
    "analysis_type": "comprehensive"
  }'
```

## 🔄 定时任务设置

### 使用Supabase Cron Jobs (推荐)

1. **在Supabase Dashboard中设置**:
   - 进入 `Database > Cron Jobs`
   - 创建新的Cron Job

2. **每日更新股票数据**:
```sql
-- 每天早上9点更新股票列表
SELECT cron.schedule(
  'daily-stock-update',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/stock-data-fetcher',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    body := '{"action": "fetch_stock_list", "page_size": 500}'::jsonb
  );
  $$
);
```

3. **每小时更新热门股票**:
```sql
-- 每小时更新前100只活跃股票
SELECT cron.schedule(
  'hourly-active-stocks',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/stock-data-fetcher',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    body := '{"action": "fetch_stock_list", "page_size": 100}'::jsonb
  );
  $$
);
```

## 🧪 测试部署

### 1. 测试股票数据获取
```javascript
// 在浏览器控制台或Node.js中测试
const testStockDataFetcher = async () => {
  const response = await fetch('https://your-project.supabase.co/functions/v1/stock-data-fetcher', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_ANON_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'fetch_stock_list',
      page_size: 10
    })
  });
  
  const result = await response.json();
  console.log('股票数据获取结果:', result);
};

testStockDataFetcher();
```

### 2. 测试AI分析
```javascript
const testAIAnalysis = async () => {
  const response = await fetch('https://your-project.supabase.co/functions/v1/ai-analysis', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_ANON_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ticker: '000001',
      user_id: 'test-user-id',
      analysis_type: 'comprehensive'
    })
  });
  
  const result = await response.json();
  console.log('AI分析结果:', result);
};

testAIAnalysis();
```

## 📊 监控和日志

1. **在Supabase Dashboard中查看**:
   - `Edge Functions > Logs` 查看函数执行日志
   - `Edge Functions > Metrics` 查看性能指标

2. **常见问题排查**:
   - 检查环境变量是否正确配置
   - 确认API密钥权限
   - 查看函数执行日志中的错误信息

## 🔐 安全注意事项

1. **API密钥管理**:
   - 使用环境变量存储敏感信息
   - 定期轮换API密钥
   - 限制API密钥权限

2. **访问控制**:
   - 配置适当的RLS策略
   - 使用JWT验证用户身份
   - 限制函数调用频率

## 📈 性能优化

1. **缓存策略**:
   - 实现Redis缓存减少API调用
   - 设置合理的数据更新频率
   - 使用CDN加速静态资源

2. **错误处理**:
   - 实现重试机制
   - 记录详细的错误日志
   - 设置告警通知

## 🎯 下一步计划

1. **数据质量监控**:
   - 实现数据完整性检查
   - 设置数据异常告警
   - 定期数据质量报告

2. **功能扩展**:
   - 添加更多数据源
   - 实现实时数据推送
   - 增加更多AI分析维度
