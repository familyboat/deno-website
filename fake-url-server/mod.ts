import {Hono} from "@hono/hono"
import { compress } from '@hono/hono/compress'
import { proxy } from '@hono/hono/proxy'

const app = new Hono();
app.use(compress())
app.get("/", (c) => {
  const url = c.req.query("url");
  if (!url) {
    return Promise.resolve(new Response("You must provide a url", { status: 400 }))
  }

  return proxy(url).then((response) => {
    response.headers.set("X-Version", "1.0");
    response.headers.set("X-Proxy", "Hono");
    return response;
  })
})

export default app;