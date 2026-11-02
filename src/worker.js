// /api/state だけ Durable Object に渡し、それ以外は public/ の静的ファイルを返す
export class Store {
  constructor(state) { this.state = state; }
  async fetch(req) {
    const cur = (await this.state.storage.get('s')) || null;
    if (req.method === 'PUT') {
      let inc;
      try { inc = await req.json(); } catch { return new Response('bad', { status: 400 }); }
      if (!inc || typeof inc !== 'object' || JSON.stringify(inc).length > 500000)
        return new Response('bad', { status: 400 });
      if (!cur || (inc.updated || 0) >= (cur.updated || 0)) {
        await this.state.storage.put('s', inc);
        return Response.json(inc);
      }
      return Response.json(cur);
    }
    return Response.json(cur);
  }
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === '/api/state') {
      const stub = env.STORE.get(env.STORE.idFromName('main'));
      const res = await stub.fetch(req);
      return new Response(res.body, { status: res.status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
    }
    return env.ASSETS.fetch(req);
  },
};
