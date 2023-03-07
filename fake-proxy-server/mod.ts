async function proxy(url: string, req: Request) {
  const proxyUrl = `https://fake-url.deno.dev/?url=${url}`;
  try {
    return await fetch(new Request(proxyUrl, { ...req }));
  } catch (e) {
    return new Response(e, {
      status: 500,
    });
  }
}

async function handle(conn: Deno.Conn) {
  for await (const e of Deno.serveHttp(conn)) {
    const resp = await proxy(e.request.url, e.request);

    return e.respondWith(resp);
  }
}

const port = parseInt(Deno.args[0] || '') || 8081

try {
  const listener = Deno.listen(
    {
      port
    },
  );

  console.log(`Listening on: http://0.0.0.0:${port}`)

  for await (const conn of listener) {
    handle(conn);
  }
} catch(e) {
  console.log(e)
}