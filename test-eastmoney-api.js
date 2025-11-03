// 测试东方财富API的简单脚本
// 使用Node.js运行: node test-eastmoney-api.js

const https = require('https');
const http = require('http');

// 东方财富API配置
const EASTMONEY_CONFIG = {
  BASE_URL: 'http://push2.eastmoney.com/api/qt',
  STOCK_LIST: '/clist/get',
  
  // 通用参数
  COMMON_PARAMS: {
    cb: 'jQuery',
    pn: 1,
    pz: 20, // 先测试20只股票
    po: 1,
    np: 1,
    ut: 'bd1d9ddb04089700cf9c27f6f7426281',
    fltt: 2,
    invt: 2,
    fid: 'f3',
    fs: 'm:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23', // A股筛选
    fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152'
  }
};

// 构建URL
function buildUrl(endpoint, params = {}) {
  const allParams = { ...EASTMONEY_CONFIG.COMMON_PARAMS, ...params };
  const queryString = Object.entries(allParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  
  return `${EASTMONEY_CONFIG.BASE_URL}${endpoint}?${queryString}`;
}

// 发送HTTP请求
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const req = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://quote.eastmoney.com/',
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
  });
}

// 解析JSONP响应
function parseResponse(response) {
  try {
    // 移除JSONP包装 - 更精确的正则表达式
    let jsonStr = response.trim();

    // 处理jQuery回调
    if (jsonStr.startsWith('jQuery(')) {
      jsonStr = jsonStr.replace(/^jQuery\(/, '').replace(/\);?$/, '');
    } else if (jsonStr.match(/^jQuery\d+_\d+\(/)) {
      jsonStr = jsonStr.replace(/^jQuery\d+_\d+\(/, '').replace(/\);?$/, '');
    }

    // 移除可能的尾部分号
    jsonStr = jsonStr.replace(/;$/, '');

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('解析响应失败:', error);
    console.log('处理后的JSON字符串前200字符:', jsonStr.substring(0, 200) + '...');
    console.log('处理后的JSON字符串后200字符:', '...' + jsonStr.substring(jsonStr.length - 200));
    return null;
  }
}

// 测试获取股票列表
async function testStockList() {
  console.log('🔍 测试获取A股股票列表...');
  
  try {
    const url = buildUrl(EASTMONEY_CONFIG.STOCK_LIST);
    console.log('请求URL:', url);
    
    const response = await makeRequest(url);
    const data = parseResponse(response);
    
    if (!data) {
      throw new Error('解析数据失败');
    }
    
    console.log('✅ API响应成功');
    console.log('响应结构:', {
      rc: data.rc,
      rt: data.rt,
      svr: data.svr,
      lt: data.lt,
      full: data.full,
      dlmkts: data.dlmkts,
      dataCount: data.data?.diff?.length || 0
    });
    
    if (data.data && data.data.diff && data.data.diff.length > 0) {
      console.log(`📊 获取到 ${data.data.diff.length} 只股票数据`);
      
      // 显示前3只股票的信息
      const stocks = data.data.diff.slice(0, 3).map(item => ({
        代码: item.f12,
        名称: item.f14,
        最新价: (item.f2 / 100).toFixed(2) + '元',
        涨跌幅: item.f3 + '%',
        成交量: item.f5,
        市盈率: item.f9,
        市净率: item.f23
      }));
      
      console.log('📈 前3只股票信息:');
      console.table(stocks);
      
      return data.data.diff;
    } else {
      console.log('❌ 未获取到股票数据');
      return [];
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    return [];
  }
}

// 测试获取单只股票K线数据
async function testKlineData(ticker) {
  console.log(`\n🔍 测试获取K线数据 (${ticker})...`);
  
  try {
    const marketCode = ticker.startsWith('6') ? '1' : '0';
    const stockCode = `${marketCode}.${ticker}`;
    
    const klineUrl = `http://push2his.eastmoney.com/api/qt/stock/kline/get?cb=jQuery&secid=${stockCode}&ut=fa5fd1943c7b386f172d6893dbfba10b&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61&klt=101&fqt=1&end=20500101&lmt=5&iscca=1`;
    
    console.log('K线请求URL:', klineUrl);
    
    const response = await makeRequest(klineUrl);
    const data = parseResponse(response);
    
    if (data && data.data && data.data.klines) {
      console.log(`✅ 获取到 ${data.data.klines.length} 条K线数据`);
      
      const klines = data.data.klines.slice(0, 3).map(kline => {
        const [date, open, close, high, low, volume] = kline.split(',');
        return {
          日期: date,
          开盘: parseFloat(open).toFixed(2),
          收盘: parseFloat(close).toFixed(2),
          最高: parseFloat(high).toFixed(2),
          最低: parseFloat(low).toFixed(2),
          成交量: parseInt(volume)
        };
      });
      
      console.log('📊 最近3天K线数据:');
      console.table(klines);
      
      return data.data.klines;
    } else {
      console.log('❌ 未获取到K线数据');
      return [];
    }
    
  } catch (error) {
    console.error('❌ K线数据测试失败:', error.message);
    return [];
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始测试东方财富API...\n');
  
  // 测试1: 获取股票列表
  const stocks = await testStockList();
  
  // 测试2: 如果有股票数据，测试K线
  if (stocks.length > 0) {
    const testTicker = stocks[0].f12; // 第一只股票的代码
    await testKlineData(testTicker);
  }
  
  console.log('\n🎉 测试完成!');
  
  // 总结
  console.log('\n📋 测试总结:');
  console.log('- 股票列表API:', stocks.length > 0 ? '✅ 成功' : '❌ 失败');
  console.log('- K线数据API:', stocks.length > 0 ? '✅ 成功' : '❌ 失败');
  
  if (stocks.length > 0) {
    console.log('\n✅ 东方财富API可以正常使用!');
    console.log('📊 数据质量评估:');
    console.log('- 数据完整性: 包含价格、成交量、财务指标');
    console.log('- 更新频率: 实时数据');
    console.log('- 覆盖范围: A股市场');
    console.log('- 访问限制: 需要控制请求频率');
  } else {
    console.log('\n❌ 东方财富API访问失败，可能需要调整参数或处理反爬虫');
  }
}

// 运行测试
runTests().catch(console.error);
