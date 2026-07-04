/**
 * LRCLIB 公開歌詞 API(https://lrclib.net,開源歌詞資料庫,支援 CORS)
 * 優先取精確比對,失敗時退回搜尋;優先回傳同步歌詞(LRC),否則回純文字。
 */

export interface LrcQuery {
  artist: string;
  track: string;
}

interface LrclibRecord {
  syncedLyrics: string | null;
  plainLyrics: string | null;
  instrumental: boolean;
}

const API = "https://lrclib.net/api";

export async function fetchLrcFromLrclib(q: LrcQuery): Promise<string> {
  // 1) 精確比對
  try {
    const res = await fetch(
      `${API}/get?artist_name=${encodeURIComponent(q.artist)}&track_name=${encodeURIComponent(q.track)}`
    );
    if (res.ok) {
      const r = (await res.json()) as LrclibRecord;
      const lrc = r.syncedLyrics || r.plainLyrics;
      if (lrc) return lrc;
    }
  } catch {
    /* 換搜尋端點重試 */
  }

  // 2) 關鍵字搜尋,挑第一筆有同步歌詞的結果
  const res = await fetch(
    `${API}/search?q=${encodeURIComponent(`${q.track} ${q.artist}`)}`
  );
  if (!res.ok) throw new Error(`LRCLIB HTTP ${res.status}`);
  const list = (await res.json()) as LrclibRecord[];
  const best = list.find((r) => r.syncedLyrics) ?? list.find((r) => r.plainLyrics);
  const lrc = best?.syncedLyrics || best?.plainLyrics;
  if (!lrc) throw new Error("LRCLIB 查無歌詞");
  return lrc;
}
