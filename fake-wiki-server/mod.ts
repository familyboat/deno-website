import { Hono } from "@hono/hono";
import { proxy } from "@hono/hono/proxy";

const app = new Hono();
app.get("/", (c) => {
  const entry = c.req.query("entry");
  if (!entry) {
    const res = c.text(
      "Entry is required, set entry with '?entry=<entry>'",
      400,
    );
    res.headers.set("X-Entry-Required", "true");
    return res;
  }

  return (async () => {
    const url = `https://en.wikipedia.org/api/rest_v1/page/pdf/${entry}`;
    const response = await proxy(url);
    response.headers.set("X-Version", "1.0");
    response.headers.set("X-Proxy", "Hono");
    return response;
  })();
});

export default app;
