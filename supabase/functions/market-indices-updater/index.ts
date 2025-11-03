// deno-lint-ignore-file no-explicit-any
// Market Indices Updater Edge Function
// Fetch latest index data (SH000001, SZ399001, SZ399006) from Eastmoney and upsert into market_indices

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { indices = ['1.000001', '0.399001', '0.399006'] } = await safeJson(req)

    // Build Eastmoney URL for multiple indices
    // Using list API (quote.eastmoney.com) similar to stocks list but filtered by indexes
    const fs = indices.map((i: string) => `b:${i}`).join(',')
    const url = `https://push2.eastmoney.com/api/qt/ulist.np/get?cb=jQuery&fltt=2&fields=f12,f14,f2,f3,f4,f5,f6,f7&secids=${indices.join(',')}`

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://quote.eastmoney.com/',
      },
    })

    if (!res.ok) {
      return json({ error: `Eastmoney HTTP ${res.status}` }, 502)
    }

    const text = await res.text()
    const data = parseJSONP(text)
    if (!data || !data.data || !data.data.diff) {
      return json({ error: 'No index data' }, 502)
    }

    const rows = data.data.diff.map((d: any) => {
      const code = d.f12 // e.g., 000001
      const name = d.f14
      const price = d.f2 / 100
      const changePercent = d.f3
      const changeAmount = d.f4 / 100
      const volume = d.f5
      const turnover = d.f6
      return {
        index_code: normalizeIndexCode(code),
        index_name: name,
        current_price: price,
        change_amount: changeAmount,
        change_percent: changePercent,
        volume,
        turnover,
        data_source: 'API',
        is_test_data: false,
        update_time: new Date().toISOString(),
      }
    })

    const { error } = await supabase.from('market_indices').upsert(rows, {
      onConflict: 'index_code',
      ignoreDuplicates: false,
    })

    if (error) {
      return json({ error: error.message }, 500)
    }

    return json({ success: true, updated: rows.length, indices: rows.map((r: any) => r.index_code) })
  } catch (e: any) {
    return json({ error: e?.message || String(e) }, 500)
  }
})

function parseJSONP(resp: string): any {
  let s = resp.trim()
  if (s.startsWith('jQuery(')) s = s.replace(/^jQuery\(/, '').replace(/\);?$/, '')
  else if (/^jQuery\d+_\d+\(/.test(s)) s = s.replace(/^jQuery\d+_\d+\(/, '').replace(/\);?$/, '')
  s = s.replace(/;$/, '')
  try { return JSON.parse(s) } catch { return null }
}

function normalizeIndexCode(code: string): string {
  // map eastmoney codes to our table codes: sh000001, sz399001, sz399006
  if (code.startsWith('000001')) return 'sh000001'
  if (code.startsWith('399001')) return 'sz399001'
  if (code.startsWith('399006')) return 'sz399006'
  return code
}

async function safeJson(req: Request): Promise<any> {
  try { return await req.json() } catch { return {} }
}

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}

