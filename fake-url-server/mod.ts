import { Hono } from "@hono/hono";
import { compress } from "@hono/hono/compress";
import { proxy } from "@hono/hono/proxy";

const app = new Hono();
app.use(compress());
app.get("/", (c) => {
  const url = c.req.query("url");
  if (!url) {
    const res = c.text("URL is required", 400);
    res.headers.set("X-URL-Required", "true");
    return res;
  }

  return (async () => {
    const response = await proxy(url);
    response.headers.set("X-Version", "1.0");
    response.headers.set("X-Proxy", "Hono");
    return response;
  })();
});

export default app;
