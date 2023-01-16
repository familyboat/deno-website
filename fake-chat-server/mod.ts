import { Application, Router, uuid, path } from "./deps.ts";

/**
 * 记录 online 的用户。
 */
const onlineUsers = new Set();
/**
 * 当用户登录或登出时，导致 onlineUsers 变化，
 * userIndex 相对于对 onlineUsers 的一个版本化的记录。
 * onlineUsers 变化时，userIndex 加 1。
 */
let userIndex = 0;
/**
 * 当客户端与服务端建立连接后，服务端通过 server sent event 向客户端推送消息，
 * 服务端需要向客户端定时的推送 online 用户的信息，但为了避免推送相同的信息，
 * 用 userInfo 记录每一个用户已经推送过的 online 用户的版本（即 userIndex）。
 */
const userInfo = {};

const app = new Application();
const route = new Router();

route.post("/users/login", async (ctx) => {
  const request = ctx.request;
  const body = request.body();
  const payload = await body.value;
  const { name } = payload;
  const uid = uuid.v1.generate();
  const newName = `${name}-${uid}`;
  onlineUsers.add(newName);
  userIndex++;
  ctx.response.body = {
    name: newName,
  };
});

route.post("/users/logout", async (ctx) => {
  const request = ctx.request;
  const body = request.body();
  const payload = await body.value;
  const { name } = payload;
  onlineUsers.delete(name);
  userIndex++;
  ctx.response.status = 200;
});

app.use(route.routes());

app.use((ctx) => {
  const url = new URL(ctx.request.url);
  const { pathname } = url;

  // event source
  if (pathname.startsWith("/es/users")) {
    const userName = path.basename(pathname);
    const target = ctx.sendEvents();
    setInterval(() => {
      target.dispatchMessage({
        currentUser: userName,
        onlineUsers: Array.from(onlineUsers),
      });
    }, 1000);
  }
});

console.log(`Listening on http://localhost:8080`);

await app.listen({
  port: 8080,
});
