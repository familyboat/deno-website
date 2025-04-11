import { Hono } from "@hono/hono";
import { compress } from "@hono/hono/compress";
import { proxy } from "@hono/hono/proxy";
import { getCookies } from "@std/http/cookie";
import type { Context } from "@hono/hono";
import { minify } from "html-minifier-terser";
import {join} from "@std/path"

const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fake url</title>

    <style>
      /* 全局设置 */
      *, *::before, *::after {
        box-sizing: border-box;
      }
    </style>
    <style>
      /* URL 输入组件设置 */
      #url-input {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: start;
      }

      #url-input > div {
        display: flex;
        gap: 0.5rem;
      }

      input#url + span {
        display: none;
        font-size: 80%;
      }
      input#url.invalid + span {
        display: initial;
        color: red;
      }
    </style>
    <style>
      /* 访问记录 */
      #history {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
    </style>
  </head>
  <body>
    <div id="app">
      <main>
        <h2>跨越网络限制</h2>
        <p>
          网络请求在物理介质传播的过程中，会因为种种原因无法达到目标机器。通过一台跳板机做网络请求的转发，可以让部分网络请求正常到达目标机器。
        </p>
        <div id="url-input">
          <div>
            <input type="text" name="url" id="url" placeholder="URL" />
            <span>请输入要访问的 URL</span>
          </div>
          <button id="submit" type="button">访问</button>
        </div>
      </main>
      <aside>
        <h2>访问记录</h2>
        <ul id="history"></ul>
      </aside>
    </div>

    <script>
      // 通用逻辑处理
      const proxyUrl = "https://fake-url.deno.dev";

      function visit(url) {
        const realUrl = "" + proxyUrl + "?url=" + url;
        location.href = realUrl;
      }
    </script>

    <script>
      // indexdb 存储处理
      const dbName = "fake-url";
      const dbVersion = 1;
      const storeName = "history";
      const dbRequest = indexedDB.open(dbName, dbVersion);
      dbRequest.onupgradeneeded = function (event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, {
            keyPath: "id",
            autoIncrement: true,
          });
        }
      };
      dbRequest.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);

        // 读取历史记录
        const getAllRequest = store.getAll();
        getAllRequest.onsuccess = function () {
          const history = getAllRequest.result;
          history.sort((a, b) => b.now - a.now);
          const historyElement = document.getElementById("history");
          history.forEach((item) => {
            const li = document.createElement("li");
            const textNode = document.createTextNode(item.url);
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "delete";
            deleteButton.addEventListener("click", function () {
              deleteHistoryBy(item.id);
              li.remove();
            });
            deleteButton.type = "button";
            const dateTextNode = document.createTextNode(
              new Date(item.now).toLocaleString(),
            );
            const visitButton = document.createElement("button");
            visitButton.textContent = "visit";
            visitButton.addEventListener("click", function () {
              const now = Date.now();
              const dbRequest = indexedDB.open(dbName, dbVersion);
              dbRequest.onsuccess = function (event) {
                const db = event.target.result;
                const transaction = db.transaction(
                  storeName,
                  "readwrite",
                );
                const store = transaction.objectStore(storeName);
                store.put({ id: item.id, url: item.url, now });
              };
              visit(item.url);
            });
            visitButton.type = "button";
            li.appendChild(textNode);
            li.appendChild(deleteButton);
            li.appendChild(dateTextNode);
            li.appendChild(visitButton);
            li.style.display = "flex";
            li.style.gap = "0.5rem";

            historyElement.appendChild(li);
          });
        };
      };
      dbRequest.onerror = function (event) {
        console.error("Database error:", event.target.error);
      };

      function addHistory(url) {
        console.log("add history", url);
        const dbRequest = indexedDB.open(dbName, dbVersion);
        dbRequest.onsuccess = function (event) {
          const now = Date.now();
          const db = event.target.result;
          const transaction = db.transaction(storeName, "readwrite");
          const store = transaction.objectStore(storeName);
          store.add({ url, now });
        };
      }

      function deleteHistoryBy(id) {
        const dbRequest = indexedDB.open(dbName, dbVersion);
        dbRequest.onsuccess = function (event) {
          const db = event.target.result;
          const transaction = db.transaction(storeName, "readwrite");
          const store = transaction.objectStore(storeName);
          store.delete(id);
        };
      }
    </script>

    <script>
      // URL 输入处理

      /**
      @type {HTMLInputElement} urlInputElement
    */
      const urlInputElement = document.getElementById("url");
      const submitButtonElement = document.getElementById("submit");
      const historyElement = document.getElementById("history");

      function onInput() {
        const url = urlInputElement.value;
        if (url) {
          urlInputElement.classList.remove("invalid");
        }
      }

      urlInputElement.addEventListener("input", onInput);

      function submit() {
        const url = urlInputElement.value;
        if (!url) {
          urlInputElement.classList.add("invalid");
          return;
        }

        addHistory(url);
        visit(url);
      }

      submitButtonElement.addEventListener("click", submit);
    </script>
  </body>
</html>
`

const dir = import.meta.dirname as string;

const app = new Hono();
app.use(compress());
app.get("/", async (c: Context) => {
  const url = c.req.query("url");
  if (!url) {
    const indexHtml = await Deno.readTextFile(join(dir, "index.html"));
    const minifiedHtml = await minify(indexHtml, {
      collapseWhitespace: true,
      removeComments: true,
      minifyCSS: true, // 内联 CSS 也压缩
      minifyJS: true, // 内联 JS 也压缩
    });
    const res = c.html(minifiedHtml);
    return res;
  }

  return (async () => {
    try {
      const response = await proxy(url);
      response.headers.set("X-Version", "1.0");
      response.headers.set("X-Proxy", "Hono");
      response.headers.set("Set-Cookie", `proxy-url=${url}`);
      return response;
    } catch (e) {
      return c.text(`Proxing ${url} failed. Error ${e}`);
    }
  })();
});

app.get("/*", (c: Context) => {
  const cookies = getCookies(c.req.raw.headers);
  const proxyUrl = cookies["proxy-url"];

  if (!proxyUrl) {
    return c.text("Can not deal with the request without proxy url cookie");
  }

  const path = new URL(c.req.url).pathname;
  try {
    const origin = new URL(proxyUrl).origin;
    return (async () => {
      const realUrl = `${origin}${path}`;
      const response = await proxy(realUrl);
      response.headers.set("Real-URL", realUrl);
      return response;
    })();
  } catch (_e) {
    return c.text(`Proxy url is malformed: ${proxyUrl}`);
  }
});

export default app;
