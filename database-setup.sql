-- 数据库表关系建立和初始化数据脚本
-- 请按顺序分步执行

-- 步骤1: 检查并创建market_indices表
CREATE TABLE IF NOT EXISTS public.market_indices (
    id SERIAL PRIMARY KEY,
    index_code VARCHAR(20) NOT NULL UNIQUE,
    index_name VARCHAR(100) NOT NULL,
    current_price DECIMAL(10,2),
    change_amount DECIMAL(10,2),
    change_percent DECIMAL(5,2),
    volume BIGINT,
    turnover DECIMAL(15,2),
    data_source VARCHAR(20) DEFAULT 'API',
    is_test_data BOOLEAN DEFAULT false,
    update_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 步骤2: 检查并创建stocks_info表
CREATE TABLE IF NOT EXISTS public.stocks_info (
    ticker VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    market VARCHAR(20),
    industry VARCHAR(50),
    data_source VARCHAR(20) DEFAULT 'API',
    is_test_data BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 步骤3: 检查并创建stocks_daily表
CREATE TABLE IF NOT EXISTS public.stocks_daily (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    trade_date DATE NOT NULL,
    open_price DECIMAL(10,2),
    close_price DECIMAL(10,2),
    high_price DECIMAL(10,2),
    low_price DECIMAL(10,2),
    volume BIGINT,
    turnover DECIMAL(15,2),
    pe_ratio DECIMAL(8,2),
    pb_ratio DECIMAL(8,2),
    market_cap DECIMAL(15,2),
    data_source VARCHAR(20) DEFAULT 'API',
    is_test_data BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ticker, trade_date)
);

-- 步骤4: 添加外键关系（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'stocks_daily_ticker_fkey'
        AND table_name = 'stocks_daily'
    ) THEN
        ALTER TABLE public.stocks_daily
        ADD CONSTRAINT stocks_daily_ticker_fkey
        FOREIGN KEY (ticker) REFERENCES public.stocks_info(ticker)
        ON DELETE CASCADE;
    END IF;
END $$;

-- 3. 建立concept_sectors到stocks_info的外键关系（如果需要）
-- ALTER TABLE public.concept_sectors 
-- ADD CONSTRAINT concept_sectors_ticker_fkey 
-- FOREIGN KEY (ticker) REFERENCES public.stocks_info(ticker) 
-- ON DELETE CASCADE;

-- 4. 创建性能索引
CREATE INDEX IF NOT EXISTS idx_stocks_daily_ticker_trade_date 
ON public.stocks_daily(ticker, trade_date DESC);

CREATE INDEX IF NOT EXISTS idx_stocks_daily_trade_date 
ON public.stocks_daily(trade_date DESC);

-- 5. 插入测试数据到stocks_info表
INSERT INTO public.stocks_info (ticker, name, market, industry, data_source, is_test_data) VALUES
('000001', '平安银行', 'A股', '银行', 'TEST', true),
('000002', '万科A', 'A股', '房地产', 'TEST', true),
('000858', '五粮液', 'A股', '白酒', 'TEST', true),
('600036', '招商银行', 'A股', '银行', 'TEST', true),
('600519', '贵州茅台', 'A股', '白酒', 'TEST', true),
('600887', '伊利股份', 'A股', '食品饮料', 'TEST', true),
('000858', '五粮液', 'A股', '白酒', 'TEST', true)
ON CONFLICT (ticker) DO NOTHING;

-- 6. 插入测试数据到stocks_daily表
INSERT INTO public.stocks_daily (
  ticker, trade_date, open_price, close_price, high_price, low_price, 
  volume, turnover, pe_ratio, pb_ratio, market_cap, data_source, is_test_data
) VALUES
('000001', '2024-01-15', 12.50, 12.68, 12.80, 12.45, 125000000, 1580000000, 8.5, 0.9, 245600000000, 'TEST', true),
('000002', '2024-01-15', 18.20, 18.45, 18.60, 18.10, 89000000, 1640000000, 12.3, 1.2, 198500000000, 'TEST', true),
('000858', '2024-01-15', 158.50, 162.30, 165.00, 157.80, 12000000, 1950000000, 25.6, 4.8, 625000000000, 'TEST', true),
('600036', '2024-01-15', 35.80, 36.25, 36.50, 35.60, 78000000, 2830000000, 9.2, 1.1, 432000000000, 'TEST', true),
('600519', '2024-01-15', 1680.00, 1720.50, 1735.00, 1675.00, 2800000, 4820000000, 28.5, 8.9, 2160000000000, 'TEST', true),
('600887', '2024-01-15', 28.90, 29.45, 29.80, 28.75, 45000000, 1320000000, 18.7, 3.2, 189000000000, 'TEST', true);

-- 7. 插入市场指数测试数据
INSERT INTO public.market_indices (index_code, index_name, current_price, change_amount, change_percent, data_source, is_test_data) VALUES
('000001', '上证指数', 3156.48, 15.32, 0.49, 'TEST', true),
('399001', '深证成指', 10245.67, -28.45, -0.28, 'TEST', true),
('399006', '创业板指', 2089.34, 12.78, 0.62, 'TEST', true)
ON CONFLICT (index_code) DO UPDATE SET
  current_price = EXCLUDED.current_price,
  change_amount = EXCLUDED.change_amount,
  change_percent = EXCLUDED.change_percent,
  update_time = CURRENT_TIMESTAMP;

-- 8. 设置RLS策略（行级安全）- 允许匿名用户读取
ALTER TABLE public.stocks_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stocks_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_indices ENABLE ROW LEVEL SECURITY;

-- 创建只读策略
CREATE POLICY "Allow anonymous read access" ON public.stocks_info
FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access" ON public.stocks_daily
FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access" ON public.market_indices
FOR SELECT USING (true);

-- 9. 为用户认证准备用户相关表的策略（如果需要）
-- 这些表将在用户登录后使用
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_news ENABLE ROW LEVEL SECURITY;

-- 新闻表允许所有人读取
CREATE POLICY "Allow anonymous read access" ON public.financial_news
FOR SELECT USING (true);

-- 自选股表只允许用户访问自己的数据
CREATE POLICY "Users can only access their own watchlists" ON public.watchlists
FOR ALL USING (auth.uid() = user_id);
