import { search } from "./src/search.ts";
import { Application, Router } from "./deps.ts";
import { getVideo, getVideos } from "./src/video.ts";

const port = 8080;

const app = new Application();
const router = new Router();

router
  .post("/search", async (ctx, next) => {
    const req = ctx.request;
    const reqBody = req.body({ type: "json" });
    const { keyword } = await reqBody.value;
    const searchResult = await search(keyword);

    ctx.response.body = searchResult;
    await next();
  })
  .get("/videos", async (ctx, next) => {
    const req = ctx.request;
    const url = new URL(req.url);
    const remoteUrl = url.searchParams.get("url");
    if (remoteUrl === null) {
      ctx.response.body = "url does not exist";
    } else {
      const videosResult = await getVideos(new URL(remoteUrl).pathname);
      ctx.response.body = videosResult;
    }
    await next();
  })
  .get("/video", async (ctx, next) => {
    const req = ctx.request;
    const url = new URL(req.url);
    const remoteUrl = url.searchParams.get("url");
    if (remoteUrl === null) {
      ctx.response.body = "url does not exist";
    } else {
      const videoResult = await getVideo(new URL(remoteUrl).pathname);
      ctx.response.body = videoResult;
    }
    await next();
  });

app.use(router.routes());
app.use(router.allowedMethods());

// append access control header
app.use((ctx) => {
  ctx.response.headers.append("access-control-allow-origin", "*");
});

console.log(`Listening on: http://localhost:${port}`);

await app.listen({
  port,
});
