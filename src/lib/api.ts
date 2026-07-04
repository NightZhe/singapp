/**
 * 公開資訊串接模組
 * 統一的 fetch 封裝:逾時控制、錯誤處理,供音檔索引 / LRC 歌詞 / 簡譜資料共用。
 * 音檔與歌詞的離線快取由 Service Worker(workbox runtimeCaching)負責。
 */

const DEFAULT_TIMEOUT = 10_000;

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}:${url}`);
    return res;
  } finally {
    clearTimeout(timer);
  }
}

/** 抓取遠端曲目索引(JSON 陣列),失敗時丟出錯誤由呼叫端 fallback 至內建資料 */
export async function fetchSongIndex<T>(indexUrl: string): Promise<T> {
  const res = await fetchWithTimeout(indexUrl);
  return (await res.json()) as T;
}

/** 抓取 LRC 歌詞純文字 */
export async function fetchLrc(lrcUrl: string): Promise<string> {
  const res = await fetchWithTimeout(lrcUrl);
  return res.text();
}

/** 抓取簡譜資料(JSON 結構)或回傳圖片 URL 本身 */
export async function fetchJianpu<T>(scoreUrl: string): Promise<T | { imageUrl: string }> {
  if (/\.(png|jpe?g|webp|svg)$/i.test(scoreUrl)) return { imageUrl: scoreUrl };
  const res = await fetchWithTimeout(scoreUrl);
  return (await res.json()) as T;
}
