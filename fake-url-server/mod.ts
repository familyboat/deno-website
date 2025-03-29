import { Hono } from "@hono/hono";
import { compress } from "@hono/hono/compress";
import { proxy } from "@hono/hono/proxy";
import {getCookies} from '@std/http/cookie'

const app = new Hono();
app.use(compress());
app.get("/", (c) => {
  const url = c.req.query("url");
  if (!url) {
    const res = c.text("Url is required, set url with '?url=<url>'", 400);
    res.headers.set("X-URL-Required", "true");
    return res;
  }

  return (async () => {
    try {
      const response = await proxy(url);
      response.headers.set("X-Version", "1.0");
      response.headers.set("X-Proxy", "Hono");
      response.headers.set("Set-Cookie", `proxy-url=${url}`)
      return response;
    } catch (_e) {
      return c.text(`Url is malformed: ${url}`)
    }
  })();
});

app.get("/*", (c) => {
  const cookies = getCookies(c.req.raw.headers);
  const proxyUrl = cookies['proxy-url'];

  if (!proxyUrl) {
    return c.text('Can not deal with the request without proxy url cookie');
  }

  const path = new URL(c.req.url).pathname;
  try {
    const origin = new URL(proxyUrl).origin;
    return (async () => {
      const realUrl = `${origin}${path}`
      const response = await proxy(realUrl);
      response.headers.set('Real-URL', realUrl);
      return response
    })()
  } catch (_e) {
    return c.text(`Proxy url is malformed: ${proxyUrl}`)
  }
})

export default app;
