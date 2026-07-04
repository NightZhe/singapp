/**
 * YouTube 串接:官方 IFrame Player API(合規嵌入播放,非下載音軌)。
 * 曲目可內建 youtubeId,或由使用者貼上連結後存於 localStorage。
 */
import type { Song } from "../data/songs";

let apiPromise: Promise<NonNullable<Window["YT"]>> | null = null;

/** 載入 IFrame API script(只載一次) */
export function loadYouTubeApi(): Promise<NonNullable<Window["YT"]>> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        resolve(window.YT!);
      };
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.async = true;
      document.head.appendChild(s);
    });
  }
  return apiPromise;
}

/** 從各種 YouTube 連結格式(watch / youtu.be / shorts / embed)或裸 ID 解析出影片 ID */
export function parseYouTubeInput(input: string): string | null {
  const trimmed = input.trim();
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;
  try {
    const u = new URL(trimmed);
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1).split("/")[0];
      return /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (u.hostname.endsWith("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v && /^[\w-]{11}$/.test(v)) return v;
      const m = u.pathname.match(/\/(?:embed|shorts|live)\/([\w-]{11})/);
      if (m) return m[1];
    }
  } catch {
    /* 不是合法 URL */
  }
  return null;
}

const storageKey = (songId: string) => `yt-${songId}`;

export const setStoredYoutubeId = (songId: string, videoId: string): void =>
  localStorage.setItem(storageKey(songId), videoId);

/** 取得曲目的 YouTube 音源:使用者自訂連結優先於內建 ID */
export function resolveYoutubeId(song: Pick<Song, "id" | "youtubeId">): string | undefined {
  return localStorage.getItem(storageKey(song.id)) ?? song.youtubeId ?? undefined;
}
