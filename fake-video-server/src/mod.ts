import { search, getVideos, hdmoliGetVideo, ylwtGetVideo } from "./vendor.ts";

type VendorType = "hdmoli" | "ylwt";

interface Vendor {
  setUrl(fragment: string, isSearching: boolean): void;
  search(): Promise<string>;
  getVideos(): Promise<string>;
  getVideo(): Promise<string>;
}

const urlError = new Error("Url is not defined");

export class VendorService implements Vendor {
  #remoteHost = {
    hdmoli: "https://www.hdmoli.com",
    ylwt: "https://www.cmqxysg.com/",
  };
  #vendorType: VendorType;
  #url: string | null = null;
  #body: URLSearchParams | undefined;

  constructor(vendorType: VendorType) {
    this.#vendorType = vendorType;
  }

  setUrl(fragment: string, isSearching = false): void {
    const vendorType = this.#vendorType;
    const remoteHost = this.#remoteHost[vendorType];
    if (isSearching) {
      switch (vendorType) {
        case "hdmoli":
          this.#url = remoteHost + "/search.php?searchword=" + fragment;
          break;
        case "ylwt":
          this.#url = remoteHost + "/vodsearch/-------------.html";
          this.#body = new URLSearchParams();
          this.#body.append("wd", fragment);
          this.#body.append("submit", "");
          break;
        default:
          this.#url = null;
      }
    } else {
      this.#url = remoteHost + fragment;
    }
  }

  async search(): Promise<string> {
    const url = this.#url;
    const body = this.#body;
    if (url === null) throw urlError;
    this.#url = null;
    return await search(url, { body });
  }

  async getVideos(): Promise<string> {
    const url = this.#url;
    if (url === null) throw urlError;
    this.#url = null;
    const resp = await getVideos(url);
    return resp;
  }

  async getVideo(): Promise<string> {
    const url = this.#url;
    const vendorType = this.#vendorType;
    if (url === null) throw urlError;
    this.#url = null;
    switch (vendorType) {
      case "hdmoli":
        return await hdmoliGetVideo(url);
      case "ylwt":
        return await ylwtGetVideo(url);
      default:
        return "";
    }
  }
}

export const hdmoliVendorService = new VendorService("hdmoli");
export const ylwtVendorService = new VendorService("ylwt");
