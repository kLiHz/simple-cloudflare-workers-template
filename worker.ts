
export interface Env {
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {

    function putCache(cacheKey: Request, response: Response) {
      ctx.waitUntil(caches.default.put(cacheKey, response.clone()));
      return response;
    }

    const url = new URL(request.url);

    if (url.pathname == '/favicon.ico') {
      const cacheKey = new Request(request.url);
      const cachedResponse = await caches.default.match(cacheKey);
      if (!cachedResponse) {
        const favicon = await fetch('https://workers.cloudflare.com/favicon.ico');
        return putCache(cacheKey, new Response(favicon.body, {
          headers: {
            'Cache-Control': 's-maxage=86400',
            'Content-Type': favicon.headers.get('Content-Type') || 'image/vnd.microsoft.icon',
          },
        }));
      }
      return cachedResponse;
    }

    return new Response(`Hi, you're visiting "${url.pathname}" under "${url.origin}".`);
  },
};
