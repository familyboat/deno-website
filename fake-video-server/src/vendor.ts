import { DOMParser, Element } from "../deps.ts";

type SearchOptions = {
  body?: URLSearchParams;
};

export async function search(url: string, options: SearchOptions = {}) {
  const { body } = options;
  const method = body ? "POST" : "GET";
  const resp = await fetch(url, {
    method,
    body,
  });
  if (resp.status === 200) {
    const html = await resp.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const searchList =
      doc?.querySelector("#searchList") || doc?.querySelector(".stui-vodlist");
    return searchList?.innerHTML || "";
  }
  return "";
}

export async function getVideos(url: string) {
  const resp = await fetch(url);
  if (resp.status === 200) {
    const respResult = await resp.text();
    const doc = new DOMParser().parseFromString(respResult, "text/html");
    const hdmoli = doc?.querySelector(".tab-content.myui-panel_bd");
    if (hdmoli) return hdmoli.innerHTML;
    const ylwt =
      doc?.querySelectorAll(".stui-content__playlist.sort-list") || [];
    let ret = "";
    ylwt.forEach((node) => {
      ret += (node as Element).innerHTML;
    });
    return ret;
  }
  return "";
}

export async function hdmoliGetVideo(url: string) {
  const resp = await fetch(url);
  if (resp.status === 200) {
    const respResult = await resp.text();

    const vid = respResult.match(/var vid="(.*?)"/)?.[1] || "";
    const vfrom = respResult.match(/var vfrom="(.*?)"/)?.[1] || "";
    const vpart = respResult.match(/var vpart="(.*?)"/)?.[1] || "";
    // const pn = respResult.match(/var pn="(.*?)"/)?.[1] || '';
    const now = respResult.match(/var now="(.*?)"/)?.[1] || "";
    const next = respResult.match(/var next="(.*?)"/)?.[1] || "";
    // const prePage = respResult.match(/var prePage="(.*?)"/)?.[1] || '';
    const nextPage = respResult.match(/var nextPage="(.*?)"/)?.[1] || "";

    if (!Number.isInteger(+now)) return "";

    const videoUrl =
      "https://www.hdmoli.com/js/player/dplayer/dplayer.html?v=1.61&videourl=" +
      nextPage +
      "," +
      "https://www.hdmoli.com/api/webvideo.php?url=" +
      now +
      "," +
      next +
      "," +
      vid +
      "," +
      vfrom +
      "," +
      vpart;

    return videoUrl;
  }
  return "";
}

export async function ylwtGetVideo(url: string) {
  const resp = await fetch(url);
  if (resp.status === 200) {
    const doc = await resp.text();
    const playerStr = doc.match(/var player_aaaa=(.*?)<\/script>/)?.[1];
    if (playerStr === undefined) return "";
    const player = JSON.parse(playerStr);
    const videoSrc =
      "https://player.jingjiezhenkong.com/?url=" +
      player.url +
      "&jump=https://www.ylwt33.com" +
      player.link_next +
      "&title=" +
      player.vod_title +
      "+" +
      player.vod_title_name +
      "&thumb=" +
      player.vod_pic_thumb +
      "&id=" +
      player.id +
      "&nid=" +
      player.nid;

    return videoSrc;
  }
  return "";
}
