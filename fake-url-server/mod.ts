function parseUrl(url: string) {
  const u = new URL(url);
  return u.searchParams.get("url");
}

async function fetchUrl(url: string, req: Request) {
  return await fetch(new Request(url, {...req}))
}

async function handle(conn: Deno.Conn) {
  for await (const e of Deno.serveHttp(conn)) {
    const url = parseUrl(e.request.url);
    if (!url) {
      return e.respondWith(new Response("You should append url"));
    }

    const resp = await fetchUrl(url, e.request);
    return e.respondWith(resp);
  }
}

try {
  const port = parseInt(Deno.args.at(0) || '') || 8082

  const listener = Deno.listen({
    port
  });

  console.log(`Listening on: http://0.0.0.0:${port}`)

  for await (const conn of listener) {
    handle(conn);
  }
} catch (e) {
  console.log(e)
}