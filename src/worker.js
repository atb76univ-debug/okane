// /api/state: データの読み書き / /api/pay: Android から PayPay 通知を受け取る
const base = () => {
  const d = new Date(Date.now() + 9 * 3600e3).toISOString();
  return { allow: 40000, baito: 50000, start: d.slice(0, 7), subs: [], exp: [], updated: 0 };
};

export class Store {
  constructor(state) { this.state = state; }
  async fetch(req) {
    const path = new URL(req.url).pathname;
    const cur = (await this.state.storage.get('s')) || null;
    if (path === '/pay') {
      const text = (await req.text()).slice(0, 1000);
      if (/受け取|チャージ|入金|ポイント/.test(text) && !/支払/.test(text)) return Response.json({ ignored: 'not a payment' });
      const m = text.match(/([\d,]+)\s*円/);
      const amt = m ? Number(m[1].replace(/,/g, '')) : 0;
      if (!amt) return new Response('no amount', { status: 422 });
      const st = text.match(/店舗名[:：]\s*([^\n\r]+)/);
      const s = cur || base();
      const ts = Date.now();
      if (s.exp.some(e => e.auto && e.amt === amt && ts - e.ts < 120000)) return Response.json({ ignored: 'duplicate' });
      s.exp.push({ id: ts, ts, date: new Date(ts + 9 * 3600e3).toISOString().slice(0, 10), amt, src: 'allow', memo: st ? st[1].trim() : 'PayPay', auto: true, chk: false, raw: text.slice(0, 200) });
      s.updated = ts;
      await this.state.storage.put('s', s);
      return Response.json({ ok: true, amt });
    }
    if (req.method === 'PUT') {
      let inc;
      try { inc = await req.json(); } catch { return new Response('bad', { status: 400 }); }
      if (!inc || typeof inc !== 'object' || JSON.stringify(inc).length > 500000) return new Response('bad', { status: 400 });
      if (!cur || (inc.updated || 0) >= (cur.updated || 0)) { await this.state.storage.put('s', inc); return Response.json(inc); }
      return Response.json(cur);
    }
    return Response.json(cur);
  }
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const stub = () => env.STORE.get(env.STORE.idFromName('main'));
    const json = r => new Response(r.body, { status: r.status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
    if (url.pathname === '/api/state') return json(await stub().fetch(req));
    if (url.pathname === '/api/pay') {
      if (req.method !== 'POST' || !env.PAY_KEY || url.searchParams.get('key') !== env.PAY_KEY) return new Response('unauthorized', { status: 401 });
      return json(await stub().fetch(new Request('https://do/pay', { method: 'POST', body: await req.text() })));
    }
    return env.ASSETS.fetch(req);
  },
};
