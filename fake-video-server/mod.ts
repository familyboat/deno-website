import {
  hdmoliVendorService,
  VendorService,
  ylwtVendorService,
} from "./src/mod.ts";
import { Application, Router } from "./deps.ts";

const NoResults = "No results";

const port = 8080;

const app = new Application();
const router = new Router();

const vendorServiceList = [ylwtVendorService, hdmoliVendorService];
let currentVendorService: VendorService | null = null;

router
  .post("/search", async (ctx, next) => {
    const req = ctx.request;
    const reqBody = req.body({ type: "json" });
    const { keyword } = await reqBody.value;
    let searchResult = "";
    for (const vendorService of vendorServiceList) {
      vendorService.setUrl(keyword, true);
      searchResult = await vendorService.search();
      if (!searchResult.includes("对不起")) {
        currentVendorService = vendorService;
        break;
      }
    }

    ctx.response.body = searchResult || NoResults;
    await next();
  })
  .get("/videos", async (ctx, next) => {
    const req = ctx.request;
    const url = new URL(req.url);
    const remoteUrl = url.searchParams.get("url");
    if (remoteUrl === null) {
      ctx.response.body = "url does not exist";
    } else {
      const pathname = new URL(remoteUrl).pathname;
      currentVendorService?.setUrl(pathname);
      const videosResult = await currentVendorService?.getVideos();
      ctx.response.body = videosResult || NoResults;
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
      const pathname = new URL(remoteUrl).pathname;
      currentVendorService?.setUrl(pathname);

      const videoResult = await currentVendorService?.getVideo();
      ctx.response.body = videoResult || NoResults;
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
