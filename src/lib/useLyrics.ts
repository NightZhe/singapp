import { useEffect, useMemo, useState } from "react";
import type { Song } from "../data/songs";
import { fetchLrcFromLrclib } from "./lyricsApi";
import { parseLrc, type LrcLine } from "./lrc";

const memCache = new Map<string, string>();

/**
 * 取得歌曲歌詞:內建 lrc 直接用;有 lrcQuery 的曲目改由 LRCLIB 執行期抓取,
 * 並寫入 localStorage 供離線重複使用。
 */
export function useLyrics(song: Song | null | undefined): {
  lrc: string;
  loading: boolean;
  error: boolean;
} {
  const [state, setState] = useState({ lrc: "", loading: false, error: false });

  useEffect(() => {
    if (!song) {
      setState({ lrc: "", loading: false, error: false });
      return;
    }
    if (song.lrc) {
      setState({ lrc: song.lrc, loading: false, error: false });
      return;
    }
    if (!song.lrcQuery) {
      setState({ lrc: "", loading: false, error: false });
      return;
    }

    const key = `lrc-${song.id}`;
    const cached = memCache.get(key) ?? localStorage.getItem(key);
    if (cached) {
      memCache.set(key, cached);
      setState({ lrc: cached, loading: false, error: false });
      return;
    }

    let alive = true;
    setState({ lrc: "", loading: true, error: false });
    fetchLrcFromLrclib(song.lrcQuery)
      .then((lrc) => {
        if (!alive) return;
        memCache.set(key, lrc);
        try {
          localStorage.setItem(key, lrc);
        } catch {
          /* 空間不足時略過持久化 */
        }
        setState({ lrc, loading: false, error: false });
      })
      .catch(() => {
        if (alive) setState({ lrc: "", loading: false, error: true });
      });
    return () => {
      alive = false;
    };
  }, [song?.id, song?.lrc, song?.lrcQuery]);

  return state;
}

/** 取得可逐字對位到簡譜的歌詞行(含時間軸,去除空行與「(前奏)」等標記行) */
export function useTimedLyricLines(song: Song | null | undefined): LrcLine[] {
  const { lrc } = useLyrics(song);
  return useMemo(
    () => parseLrc(lrc).filter((l) => l.text && !/^[((]/.test(l.text)),
    [lrc]
  );
}
