import { Hono } from "@hono/hono";
import { compress } from "@hono/hono/compress";
import { proxy } from "@hono/hono/proxy";
import { getCookies } from "@std/http/cookie";
import type { Context } from "@hono/hono";
import { minify } from "html-minifier-terser";

const root = Deno.cwd();

const app = new Hono();
app.use(compress());
app.get("/", async (c: Context) => {
  const url = c.req.query("url");
  if (!url) {
    const indexHtml = Deno.readTextFileSync(`${root}/index.html`);
    const minifiedHtml = await minify(indexHtml, {
      collapseWhitespace: true,
      removeComments: true,
      minifyCSS: true, // 内联 CSS 也压缩
      minifyJS: true, // 内联 JS 也压缩
    });
    const res = c.html(minifiedHtml);
    return res;
  }

  return (async () => {
    try {
      const response = await proxy(url);
      response.headers.set("X-Version", "1.0");
      response.headers.set("X-Proxy", "Hono");
      response.headers.set("Set-Cookie", `proxy-url=${url}`);
      return response;
    } catch (e) {
      return c.text(`Proxing ${url} failed. Error ${e}`);
    }
  })();
});

app.get("/*", (c: Context) => {
  const cookies = getCookies(c.req.raw.headers);
  const proxyUrl = cookies["proxy-url"];

  if (!proxyUrl) {
    return c.text("Can not deal with the request without proxy url cookie");
  }

  const path = new URL(c.req.url).pathname;
  try {
    const origin = new URL(proxyUrl).origin;
    return (async () => {
      const realUrl = `${origin}${path}`;
      const response = await proxy(realUrl);
      response.headers.set("Real-URL", realUrl);
      return response;
    })();
  } catch (_e) {
    return c.text(`Proxy url is malformed: ${proxyUrl}`);
  }
});

export default app;
