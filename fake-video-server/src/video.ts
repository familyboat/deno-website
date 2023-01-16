import { DOMParser } from "../deps.ts";
import { remoteHost } from "./_constant.ts";

function setUrl(pathname: string) {
  return remoteHost + pathname;
}

export async function getVideos(pathname: string) {
  const url = setUrl(pathname);
  const resp = await fetch(url);
  if (resp.status === 200) {
    const respResult = await resp.text();
    const doc = new DOMParser().parseFromString(respResult, "text/html");
    const videos = doc?.querySelector(".tab-content.myui-panel_bd");

    return videos?.innerHTML || "";
  }
  return "";
}

export async function getVideo(pathname: string) {
  const url = setUrl(pathname);
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

    const videoSrc =
      "/js/player/dplayer/dplayer.html?v=1.61&videourl=" +
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
    const videoSrcUrl = setUrl(videoSrc);

    return videoSrcUrl;
  }
  return "";
}
