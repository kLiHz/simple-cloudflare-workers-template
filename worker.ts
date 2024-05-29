
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

    const PATH_PREFIX = '/workers-template/';

    // strip path prefix
    if (url.pathname.startsWith(PATH_PREFIX)) {
      url.pathname = url.pathname.slice(PATH_PREFIX.length - 1);
    }

    const cacheKey = new Request(url, request);
    const cachedResponse = await caches.default.match(cacheKey);
    if (cachedResponse) { return cachedResponse; }

    if (url.pathname == '/something-cached') {
      return putCache(cacheKey, new Response('This content should be cached.', {
        headers: {
          'Cache-Control': 's-maxage=86400',
          'Content-Type': 'text/plain; charset=utf-8',
        }
      }));
    }

    return new Response(`Hi, you're visiting "${url.pathname}" under "${url.origin}".`);
  },
};
