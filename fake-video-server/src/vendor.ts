import { DOMParser } from "../deps.ts";

export async function search(url: string) {
  const resp = await fetch(url, {
    headers: {
      cookie:
        "history=%5B%7B%22name%22%3A%22%E4%BD%A0%E5%A5%BD%E6%98%9F%E6%9C%9F%E5%85%AD%22%2C%22pic%22%3A%22https%3A%2F%2Fpic.wujinpp.com%2Fupload%2Fvod%2F20220102-1%2Fe23fad3e39e2ca7d273566770c8ceefa.jpg%22%2C%22link%22%3A%22%2Fvodplay%2F650-3-1.html%22%2C%22part%22%3A%2220220101%22%7D%2C%7B%22name%22%3A%22%E4%B8%AD%E5%9B%BD%E5%A5%87%E8%B0%AD%22%2C%22pic%22%3A%22https%3A%2F%2Fpic.wujinpp.com%2Fupload%2Fvod%2F20230101-1%2F56662f362d144428b7edf0da495a92fa.jpg%22%2C%22link%22%3A%22%2Fvodplay%2F48864-3-1.html%22%2C%22part%22%3A%22%E7%AC%AC01%E9%9B%86%22%7D%2C%7B%22name%22%3A%22%E8%AF%B7%E5%90%9B%22%2C%22pic%22%3A%22https%3A%2F%2Fpic.wujinpp.com%2Fupload%2Fvod%2F20220915-1%2F4c1ab976d3213080b1a4d8ca83a75c8d.jpg%22%2C%22link%22%3A%22%2Fvodplay%2F503-1-1.html%22%2C%22part%22%3A%22%E7%AC%AC01%E9%9B%86%22%7D%2C%7B%22name%22%3A%22%E7%A9%86%E6%A1%82%E8%8B%B1%E6%8C%82%E5%B8%85%22%2C%22pic%22%3A%22https%3A%2F%2Fpic.wujinpp.com%2Fupload%2Fvod%2F20210725-1%2F261bac9c8660be39faa537608fc617d8.jpg%22%2C%22link%22%3A%22%2Fvodplay%2F42886-1-1.html%22%2C%22part%22%3A%22%E7%AC%AC01%E9%9B%86%22%7D%2C%7B%22name%22%3A%22%E5%8E%BB%E6%9C%89%E9%A3%8E%E7%9A%84%E5%9C%B0%E6%96%B9%22%2C%22pic%22%3A%22https%3A%2F%2Fpic.wujinpp.com%2Fupload%2Fvod%2F20230103-1%2F4c91666ac753adc17d4b9052de1eae6d.jpg%22%2C%22link%22%3A%22%2Fvodplay%2F48899-3-1.html%22%2C%22part%22%3A%22%E7%AC%AC01%E9%9B%86%22%7D%2C%7B%22name%22%3A%22%E5%88%A9%E5%88%83%E5%87%BA%E9%9E%982%22%2C%22pic%22%3A%22https%3A%2F%2Fimg2.doubanio.com%2Fview%2Fphoto%2Fs_ratio_poster%2Fpublic%2Fp2882492021.jpg%22%2C%22link%22%3A%22%2Fvodplay%2F14169-1-1.html%22%2C%22part%22%3A%221080P%22%7D%5D; PHPSESSID=n0t5vuchrbjm5k91erdpipsmr5",
    },
  });
  console.log(url);
  if (resp.status === 200) {
    const html = await resp.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const searchList = doc?.querySelector("#searchList");
    return searchList?.innerHTML || "";
  }
  return "";
}

export async function getVideos(url: string) {
  const resp = await fetch(url);
  if (resp.status === 200) {
    const respResult = await resp.text();
    const doc = new DOMParser().parseFromString(respResult, "text/html");
    const videos = doc?.querySelector(".tab-content.myui-panel_bd");

    return videos?.innerHTML || "";
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
