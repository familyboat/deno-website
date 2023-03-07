function parseUrl(url: string) {
  const u = new URL(url);
  return u.searchParams.get("url");
}

const listener = Deno.listen({
  port: 8080,
});

async function handle(conn: Deno.Conn) {
  for await (const e of Deno.serveHttp(conn)) {
    const url = parseUrl(e.request.url);
    const resp = await fetch(url);
    return e.respondWith(resp);
  }
}

for await (const conn of listener) {
  handle(conn);
}
