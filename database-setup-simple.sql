-- 智能股票分析平台数据库重建脚本（简化版）
-- 执行前请确保已备份重要数据

-- ========================================
-- 第一步：清理旧表结构
-- ========================================

-- 删除旧版本的表（如果存在）
DROP TABLE IF EXISTS watchlists CASCADE;
DROP TABLE IF EXISTS ai_analysis CASCADE;
DROP TABLE IF EXISTS stocks CASCADE;
DROP TABLE IF EXISTS stock_data CASCADE;
DROP TABLE IF EXISTS user_stocks CASCADE;
DROP TABLE IF EXISTS market_data CASCADE;
DROP TABLE IF EXISTS analysis_results CASCADE;

-- 清理可能存在的其他相关表
DROP TABLE IF EXISTS stocks_info CASCADE;
DROP TABLE IF EXISTS stocks_daily CASCADE;
DROP TABLE IF EXISTS ai_analyses CASCADE;
DROP TABLE IF EXISTS market_indices CASCADE;
DROP TABLE IF EXISTS financial_news CASCADE;
DROP TABLE IF EXISTS concept_sectors CASCADE;

-- ========================================
-- 第二步：创建新的表结构
-- ========================================

-- 1. 股票基础信息表
CREATE TABLE stocks_info (
  ticker VARCHAR(10) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  market VARCHAR(10), -- 'A股' 或 'B股'
  industry VARCHAR(50),
  list_date DATE,
  data_source VARCHAR(20) DEFAULT 'API', -- 'TEST', 'API', 'MANUAL'
  is_test_data BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. 每日股票数据表（热数据，30天）
CREATE TABLE stocks_daily (
  id SERIAL PRIMARY KEY,
  ticker VARCHAR(10) NOT NULL,
  trade_date DATE NOT NULL,
  open_price DECIMAL(10,3),
  close_price DECIMAL(10,3),
  high_price DECIMAL(10,3),
  low_price DECIMAL(10,3),
  volume BIGINT,
  turnover DECIMAL(15,2),
  pe_ratio DECIMAL(8,2),
  pb_ratio DECIMAL(8,2),
  market_cap BIGINT,
  data_source VARCHAR(20) DEFAULT 'API', -- 'TEST', 'API', 'MANUAL'
  is_test_data BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(ticker, trade_date)
);

-- 3. 用户自选股表
CREATE TABLE watchlists (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  ticker VARCHAR(10) NOT NULL,
  added_at TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  UNIQUE(user_id, ticker)
);

-- 4. AI分析结果表
CREATE TABLE ai_analyses (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  ticker VARCHAR(10) NOT NULL,
  analysis_type VARCHAR(20) NOT NULL, -- 'technical', 'fundamental', 'sentiment'
  analysis_result JSONB NOT NULL,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. 市场指数数据表
CREATE TABLE market_indices (
  id SERIAL PRIMARY KEY,
  index_code VARCHAR(10) NOT NULL, -- 'sh000001', 'sz399001', 'sz399006'
  index_name VARCHAR(20) NOT NULL, -- '上证指数', '深证成指', '创业板指'
  current_price DECIMAL(10,3),
  change_amount DECIMAL(10,3),
  change_percent DECIMAL(8,4),
  volume BIGINT,
  turnover DECIMAL(15,2),
  data_source VARCHAR(20) DEFAULT 'API', -- 'TEST', 'API', 'MANUAL'
  is_test_data BOOLEAN DEFAULT FALSE,
  update_time TIMESTAMP DEFAULT NOW()
);

-- 6. 财经新闻表
CREATE TABLE financial_news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  source VARCHAR(50),
  category VARCHAR(30), -- '宏观', '行业', '个股', '政策'
  importance_level INTEGER DEFAULT 1, -- 1-5级重要性
  related_tickers TEXT[], -- 相关股票代码数组
  publish_time TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 7. 概念板块表
CREATE TABLE concept_sectors (
  id SERIAL PRIMARY KEY,
  sector_code VARCHAR(20) NOT NULL,
  sector_name VARCHAR(50) NOT NULL,
  description TEXT,
  stock_count INTEGER DEFAULT 0,
  avg_change_percent DECIMAL(8,4),
  total_market_cap BIGINT,
  update_time TIMESTAMP DEFAULT NOW(),
  UNIQUE(sector_code)
);

-- ========================================
-- 第三步：创建索引优化查询性能
-- ========================================

-- 股票数据表索引
CREATE INDEX idx_stocks_daily_ticker ON stocks_daily(ticker);
CREATE INDEX idx_stocks_daily_trade_date ON stocks_daily(trade_date);
CREATE INDEX idx_stocks_daily_ticker_date ON stocks_daily(ticker, trade_date);

-- 自选股表索引
CREATE INDEX idx_watchlists_user_id ON watchlists(user_id);
CREATE INDEX idx_watchlists_ticker ON watchlists(ticker);

-- AI分析表索引
CREATE INDEX idx_ai_analyses_user_id ON ai_analyses(user_id);
CREATE INDEX idx_ai_analyses_ticker ON ai_analyses(ticker);
CREATE INDEX idx_ai_analyses_created_at ON ai_analyses(created_at);

-- 市场指数表索引
CREATE INDEX idx_market_indices_code ON market_indices(index_code);
CREATE INDEX idx_market_indices_update_time ON market_indices(update_time);

-- 财经新闻表索引
CREATE INDEX idx_financial_news_publish_time ON financial_news(publish_time);
CREATE INDEX idx_financial_news_category ON financial_news(category);
CREATE INDEX idx_financial_news_importance ON financial_news(importance_level);

-- 概念板块表索引
CREATE INDEX idx_concept_sectors_code ON concept_sectors(sector_code);
CREATE INDEX idx_concept_sectors_update_time ON concept_sectors(update_time);

-- ========================================
-- 第四步：插入测试数据（明确标记）
-- ========================================

-- 插入测试股票信息（明确标记为测试数据）
INSERT INTO stocks_info (ticker, name, market, industry, data_source, is_test_data) VALUES
('000001', '平安银行', 'A股', '银行', 'TEST', TRUE),
('000002', '万科A', 'A股', '房地产', 'TEST', TRUE),
('600036', '招商银行', 'A股', '银行', 'TEST', TRUE),
('600519', '贵州茅台', 'A股', '食品饮料', 'TEST', TRUE),
('000858', '五粮液', 'A股', '食品饮料', 'TEST', TRUE);

-- 插入测试市场指数数据（明确标记为测试数据）
INSERT INTO market_indices (index_code, index_name, current_price, change_amount, change_percent, volume, turnover, data_source, is_test_data) VALUES
('sh000001', '上证指数', 3234.56, 39.87, 1.25, 245600000000, 345600000000, 'TEST', TRUE),
('sz399001', '深证成指', 12345.67, -123.45, -0.99, 312300000000, 456700000000, 'TEST', TRUE),
('sz399006', '创业板指', 2567.89, 45.23, 1.79, 123400000000, 234500000000, 'TEST', TRUE);

-- 插入测试股票日线数据（明确标记为测试数据）
INSERT INTO stocks_daily (ticker, trade_date, open_price, close_price, high_price, low_price, volume, turnover, pe_ratio, pb_ratio, market_cap, data_source, is_test_data) VALUES
('000001', CURRENT_DATE, 12.30, 12.34, 12.45, 12.20, 123000000, 1520000000, 8.5, 0.9, 245600000000, 'TEST', TRUE),
('000002', CURRENT_DATE, 23.40, 23.45, 23.60, 23.30, 98000000, 2300000000, 12.3, 1.2, 234500000000, 'TEST', TRUE),
('600036', CURRENT_DATE, 34.50, 34.56, 34.70, 34.40, 76000000, 2630000000, 6.8, 0.8, 456700000000, 'TEST', TRUE),
('600519', CURRENT_DATE, 1675.00, 1678.90, 1685.00, 1670.00, 2300000, 3860000000, 28.5, 8.9, 2110000000000, 'TEST', TRUE),
('000858', CURRENT_DATE, 155.50, 156.78, 158.00, 154.80, 8700000, 1360000000, 22.1, 4.5, 623400000000, 'TEST', TRUE);

-- ========================================
-- 完成提示和验证
-- ========================================

-- 数据库重建完成！
SELECT '数据库重建完成！共创建了7张表：' as message;

-- 显示创建的表
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('stocks_info', 'stocks_daily', 'watchlists', 'ai_analyses', 'market_indices', 'financial_news', 'concept_sectors')
ORDER BY table_name;

-- 显示测试数据统计
SELECT '测试数据统计：' as info;

-- 检查stocks_info表的测试数据
SELECT 'stocks_info' as table_name, 
       COUNT(*) FILTER (WHERE is_test_data = TRUE) as test_count,
       COUNT(*) as total_count
FROM stocks_info;

-- 检查stocks_daily表的测试数据
SELECT 'stocks_daily' as table_name,
       COUNT(*) FILTER (WHERE is_test_data = TRUE) as test_count,
       COUNT(*) as total_count
FROM stocks_daily;

-- 检查market_indices表的测试数据
SELECT 'market_indices' as table_name,
       COUNT(*) FILTER (WHERE is_test_data = TRUE) as test_count,
       COUNT(*) as total_count
FROM market_indices;

-- 提示：后续可以添加管理函数
SELECT '提示：所有测试数据都已明确标记，可以通过 is_test_data = TRUE 进行识别和清理' as note;
