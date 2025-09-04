-- 数据管理工具脚本
-- 用于管理测试数据和生产数据的切换

-- ========================================
-- 1. 检查当前数据状态
-- ========================================

-- 查看所有表的测试数据统计
SELECT 
    '=== 数据状态总览 ===' as info,
    NOW() as check_time;

-- 检查各表的测试数据情况
SELECT * FROM check_test_data();

-- 详细查看测试数据
SELECT 
    'stocks_info' as table_name,
    ticker,
    name,
    data_source,
    is_test_data,
    created_at
FROM stocks_info 
WHERE is_test_data = TRUE
ORDER BY ticker;

SELECT 
    'market_indices' as table_name,
    index_code,
    index_name,
    data_source,
    is_test_data,
    update_time
FROM market_indices 
WHERE is_test_data = TRUE
ORDER BY index_code;

-- ========================================
-- 2. 测试数据管理命令
-- ========================================

-- 清理所有测试数据
-- SELECT clean_test_data();

-- 切换到生产模式（清理测试数据）
-- SELECT switch_to_production();

-- ========================================
-- 3. 生产数据验证查询
-- ========================================

-- 验证是否还有测试数据残留
CREATE OR REPLACE FUNCTION validate_production_data()
RETURNS TABLE(
    table_name TEXT,
    test_data_count BIGINT,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.table_name::TEXT,
        t.test_count,
        CASE 
            WHEN t.test_count = 0 THEN '✅ 生产就绪'
            ELSE '⚠️ 仍有测试数据'
        END as status
    FROM check_test_data() t;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 4. 数据源切换工具
-- ========================================

-- 将特定股票从测试数据标记为API数据
CREATE OR REPLACE FUNCTION mark_as_api_data(stock_ticker VARCHAR(10))
RETURNS TEXT AS $$
BEGIN
    -- 更新股票基础信息
    UPDATE stocks_info 
    SET data_source = 'API', is_test_data = FALSE 
    WHERE ticker = stock_ticker;
    
    -- 更新股票日线数据
    UPDATE stocks_daily 
    SET data_source = 'API', is_test_data = FALSE 
    WHERE ticker = stock_ticker;
    
    RETURN '股票 ' || stock_ticker || ' 已标记为API数据';
END;
$$ LANGUAGE plpgsql;

-- 批量标记多只股票为API数据
CREATE OR REPLACE FUNCTION mark_multiple_as_api_data(stock_tickers VARCHAR(10)[])
RETURNS TEXT AS $$
DECLARE
    ticker VARCHAR(10);
    count INTEGER := 0;
BEGIN
    FOREACH ticker IN ARRAY stock_tickers
    LOOP
        PERFORM mark_as_api_data(ticker);
        count := count + 1;
    END LOOP;
    
    RETURN '已将 ' || count || ' 只股票标记为API数据';
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 5. 数据质量检查
-- ========================================

-- 检查数据完整性
CREATE OR REPLACE FUNCTION check_data_integrity()
RETURNS TABLE(
    check_item TEXT,
    result TEXT,
    details TEXT
) AS $$
BEGIN
    -- 检查是否有股票信息但没有日线数据
    RETURN QUERY
    SELECT 
        '股票信息完整性'::TEXT,
        CASE 
            WHEN COUNT(*) = 0 THEN '✅ 通过'
            ELSE '❌ 失败'
        END,
        '有 ' || COUNT(*) || ' 只股票缺少日线数据'
    FROM stocks_info si
    LEFT JOIN stocks_daily sd ON si.ticker = sd.ticker
    WHERE sd.ticker IS NULL;
    
    -- 检查是否有过期的测试数据
    RETURN QUERY
    SELECT 
        '测试数据时效性'::TEXT,
        CASE 
            WHEN COUNT(*) = 0 THEN '✅ 通过'
            ELSE '⚠️ 注意'
        END,
        '有 ' || COUNT(*) || ' 条测试数据超过7天'
    FROM stocks_daily
    WHERE is_test_data = TRUE 
    AND created_at < NOW() - INTERVAL '7 days';
    
    -- 检查市场指数数据
    RETURN QUERY
    SELECT 
        '市场指数完整性'::TEXT,
        CASE 
            WHEN COUNT(*) >= 3 THEN '✅ 通过'
            ELSE '❌ 失败'
        END,
        '当前有 ' || COUNT(*) || ' 个市场指数'
    FROM market_indices
    WHERE DATE(update_time) = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 6. 自动化清理任务
-- ========================================

-- 创建定时清理过期测试数据的函数
CREATE OR REPLACE FUNCTION cleanup_expired_test_data()
RETURNS TEXT AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- 删除超过30天的测试数据
    DELETE FROM stocks_daily 
    WHERE is_test_data = TRUE 
    AND created_at < NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    DELETE FROM market_indices 
    WHERE is_test_data = TRUE 
    AND update_time < NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
    
    RETURN '已清理 ' || deleted_count || ' 条过期测试数据';
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 7. 使用说明和示例
-- ========================================

/*
使用说明：

1. 检查当前数据状态：
   SELECT * FROM check_test_data();

2. 验证生产数据：
   SELECT * FROM validate_production_data();

3. 清理所有测试数据：
   SELECT clean_test_data();

4. 切换到生产模式：
   SELECT switch_to_production();

5. 标记特定股票为API数据：
   SELECT mark_as_api_data('000001');

6. 批量标记股票为API数据：
   SELECT mark_multiple_as_api_data(ARRAY['000001', '000002', '600036']);

7. 检查数据完整性：
   SELECT * FROM check_data_integrity();

8. 清理过期测试数据：
   SELECT cleanup_expired_test_data();

注意事项：
- 执行清理操作前请确保已备份重要数据
- 生产环境中应定期运行数据完整性检查
- 测试数据仅用于开发和演示，不应在生产环境中长期保留
*/

-- 显示当前状态
SELECT '=== 数据管理工具已就绪 ===' as message;
SELECT '执行 SELECT * FROM check_test_data(); 查看当前状态' as next_step;
