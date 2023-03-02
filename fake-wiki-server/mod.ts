async function getWikiResource(entry: string) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/pdf/${entry}`;
  const resp = await fetch(url);
  let error: string | null = null;
  if (resp.status !== 200) {
    error = `The resource you just requested does not exist`;
  }
  return {
    error,
    result: resp,
  };
}

function parseEntry(url: string) {
  const u = new URL(url);
  return u.searchParams.get("entry");
}

const listener = Deno.listen(
  {
    port: 8080,
  },
);

async function handle(conn: Deno.Conn) {
  for await (const e of Deno.serveHttp(conn)) {
    const entry = parseEntry(e.request.url);
    if (!entry) {
      return e.respondWith(new Response(`You should append entry to url`));
    }
    const { error, result } = await getWikiResource(entry);
    if (error) {
      return e.respondWith(new Response(error));
    }
    return e.respondWith(result);
  }
}

for await (const conn of listener) {
  handle(conn);
}
