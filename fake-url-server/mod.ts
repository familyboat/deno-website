import {Hono} from "@hono/hono"
import { compress } from '@hono/hono/compress'
import { proxy } from '@hono/hono/proxy'

const app = new Hono();
app.use(compress())
app.get("/", (c) => {
  const url = c.req.query("url");
  if (!url) {
    return c.text("You should append url");
  }

  return proxy(url)
})

export default app;