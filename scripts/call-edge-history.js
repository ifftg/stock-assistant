const url = 'https://wvkrfaznogbruocaxfja.supabase.co/functions/v1/stock-data-fetcher';
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2a3JmYXpub2dicnVvY2F4ZmphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMjA5OTYsImV4cCI6MjA3MTc5Njk5Nn0.l2wZvz69a0TsGisqSQ19028hfL_ySk2-hJNmFrjRBzQ';

async function main() {
  const body = { action: 'fetch_stock_history', ticker: '600519', days: 30 };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: anon,
      Authorization: `Bearer ${anon}`
    },
    body: JSON.stringify(body)
  });
  console.log('HTTP', res.status);
  const text = await res.text();
  console.log(text);
}

main().catch((e) => {
  console.error('ERROR', e);
  process.exit(1);
});

