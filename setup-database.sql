-- 创建自选股表
CREATE TABLE IF NOT EXISTS public.watchlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    ticker VARCHAR(10) NOT NULL,
    stock_name VARCHAR(100),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON public.watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_ticker ON public.watchlists(ticker);
CREATE UNIQUE INDEX IF NOT EXISTS idx_watchlists_user_ticker ON public.watchlists(user_id, ticker);

-- 启用行级安全策略 (RLS)
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;

-- 删除可能存在的旧策略
DROP POLICY IF EXISTS "Users can view own watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Users can insert own watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Users can update own watchlists" ON public.watchlists;
DROP POLICY IF EXISTS "Users can delete own watchlists" ON public.watchlists;

-- 创建RLS策略：用户只能查看自己的自选股
CREATE POLICY "Users can view own watchlists" ON public.watchlists
    FOR SELECT USING (auth.uid() = user_id);

-- 创建RLS策略：用户只能插入自己的自选股
CREATE POLICY "Users can insert own watchlists" ON public.watchlists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 创建RLS策略：用户只能更新自己的自选股
CREATE POLICY "Users can update own watchlists" ON public.watchlists
    FOR UPDATE USING (auth.uid() = user_id);

-- 创建RLS策略：用户只能删除自己的自选股
CREATE POLICY "Users can delete own watchlists" ON public.watchlists
    FOR DELETE USING (auth.uid() = user_id);

-- 创建更新时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 删除可能存在的旧触发器
DROP TRIGGER IF EXISTS update_watchlists_updated_at ON public.watchlists;

-- 创建触发器，自动更新 updated_at 字段
CREATE TRIGGER update_watchlists_updated_at 
    BEFORE UPDATE ON public.watchlists 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
