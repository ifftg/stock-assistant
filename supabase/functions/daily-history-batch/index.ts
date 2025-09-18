// Edge Function: daily-history-batch
// Purpose: Batch update daily K-line (day bars) for A/B shares
// Usage:
//  POST /functions/v1/daily-history-batch
//  body: { action: 'fetch_history_batch', tickers: string[], days?: number }
//     or { action: 'fetch_all_daily', days?: number }  // reads tickers from stocks_info
// Notes:
//  - Requires env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//  - Upserts into table: stocks_daily (on conflict: ticker, trade_date)
//  - Uses EastMoney endpoints similar to stock-data-fetcher-edge-function.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EASTMONEY = {
  KLINE_URL: 'http://push2his.eastmoney.com/api/qt/stock/kline/get',
};

function parseEastmoneyResponse(text: string) {
  try {
    const json = text.replace(/^\w+\((.*)\);?$/, '$1');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function marketCodeOf(ticker: string): '1'|'0' {
  return ticker.startsWith('6') ? '1' : '0'; // 1=SH, 0=SZ
}

async function fetchLastDailyKline(ticker: string, days = 1) {
  const secid = `${marketCodeOf(ticker)}.${ticker}`;
  const url = `${EASTMONEY.KLINE_URL}?cb=jQuery&secid=${secid}`+
    `&ut=fa5fd1943c7b386f172d6893dbfba10b&fields1=f1,f2,f3,f4,f5,f6`+
    `&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61&klt=101&fqt=1&end=20500101&lmt=${days}&iscca=1`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://quote.eastmoney.com/',
    }
  });
  const text = await res.text();
  const data = parseEastmoneyResponse(text);
  if (!data || !data.data || !data.data.klines) return [] as any[];
  return data.data.klines.map((kline: string) => {
    const [date, open, close, high, low, volume, turnover] = kline.split(',');
    return {
      ticker,
      trade_date: date, // YYYY-MM-DD
      open_price: parseFloat(open),
      close_price: parseFloat(close),
      high_price: parseFloat(high),
      low_price: parseFloat(low),
      volume: parseInt(volume),
      turnover: parseFloat(turnover),
    };
  });
}

async function upsertDaily(supabase: any, rows: any[]) {
  if (!rows.length) return { count: 0 };
  const { error } = await supabase
    .from('stocks_daily')
    .upsert(rows, { onConflict: 'ticker,trade_date', ignoreDuplicates: false });
  if (error) throw new Error(`upsert stocks_daily error: ${error.message}`);
  return { count: rows.length };
}

async function getAllTickers(supabase: any): Promise<string[]> {
  const result: string[] = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('stocks_info')
      .select('ticker')
      .order('ticker')
      .range(from, from + pageSize - 1);
    if (error) throw new Error(`query stocks_info error: ${error.message}`);
    if (!data || !data.length) break;
    result.push(...data.map((r: any) => r.ticker));
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return result;
}

async function processBatch(supabase: any, tickers: string[], days = 1, concurrency = 12) {
  let ok = 0, fail = 0;
  const queue = [...tickers];
  async function worker() {
    while (queue.length) {
      const t = queue.shift()!;
      try {
        const rows = await fetchLastDailyKline(t, days);
        await upsertDaily(supabase, rows);
        ok += 1;
      } catch (e) {
        console.error('batch item failed', t, e);
        fail += 1;
      }
      // 简单限速
      await new Promise(r => setTimeout(r, 120));
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return { ok, fail };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { action, tickers = [], days = 1 } = await req.json();

    switch (action) {
      case 'fetch_history_batch': {
        if (!Array.isArray(tickers) || tickers.length === 0) {
          return new Response(JSON.stringify({ success: false, error: 'tickers required' }), { headers: corsHeaders, status: 400 });
        }
        const { ok, fail } = await processBatch(supabase, tickers, days);
        return new Response(JSON.stringify({ success: true, action, processed: ok, failed: fail }), { headers: corsHeaders });
      }
      case 'fetch_all_daily': {
        const all = await getAllTickers(supabase);
        const { ok, fail } = await processBatch(supabase, all, days);
        return new Response(JSON.stringify({ success: true, action, processed: ok, failed: fail }), { headers: corsHeaders });
      }
      default:
        return new Response(JSON.stringify({ success: false, error: `unsupported action: ${action}` }), { headers: corsHeaders, status: 400 });
    }
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ success: false, error: String(e) }), { headers: corsHeaders, status: 500 });
  }
});

