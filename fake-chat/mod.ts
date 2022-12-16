import { Application } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { transform } from "https://deno.land/x/aleph_compiler@0.7.5/mod.ts";

const app = new Application();

app.use(async (ctx) => {
  const url = new URL(ctx.request.url);
  const { pathname } = url;
  const appDir = import.meta.url;

  const extReg = /\.(.*?)$/;
  const result = extReg.exec(pathname);
  const ext = result?.[1];

  // third party
  if (pathname.startsWith("/-/")) {
    const target = pathname.replace("/-/", "https://");
    const resp = await fetch(target);
    ctx.response.body = resp.body;
    ctx.response.headers.append(
      "content-type",
      "application/javascript; charset=utf-8"
    );
  }

  // index.html
  if (pathname === "/") {
    const indexHtml = new URL("src/index.html", appDir);
    const content = await Deno.readTextFile(indexHtml);
    ctx.response.body = content;
  }

  // ts, tsx
  if (ext && ["ts", "tsx"].includes(ext)) {
    const target = new URL("src/" + pathname, appDir);
    const content = await Deno.readTextFile(target);
    const ret = await transform("./app.tsx", content);

    ctx.response.body = ret.code;
    ctx.response.headers.append(
      "content-type",
      "application/javascript; charset=utf-8"
    );
  }
});

await app.listen({
  port: 8080,
});
