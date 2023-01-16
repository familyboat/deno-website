import { searchUrl } from "./_constant.ts";
import { DOMParser } from "../deps.ts";

function setSearchUrl(keyword: string) {
  return searchUrl + keyword;
}

export async function search(keyword: string) {
  const url = setSearchUrl(keyword);
  const resp = await fetch(url);
  if (resp.status === 200) {
    const html = await resp.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const searchList = doc?.querySelector("#searchList");

    return searchList?.innerHTML || "";
  }
  return "";
}
