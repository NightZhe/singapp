import { useEffect, useState } from "react";
import type { JianpuScore, Song } from "../data/songs";
import { fetchJianpu } from "./api";

const cache = new Map<string, JianpuScore>();

/** 取得曲目簡譜:內建資料直接用;有 jianpuUrl 的曲目從 JSON 讀取(SW 會快取供離線) */
export function useJianpu(song: Song | null | undefined): {
  score: JianpuScore | undefined;
  loading: boolean;
} {
  const [state, setState] = useState<{ score?: JianpuScore; loading: boolean }>({
    loading: false
  });

  useEffect(() => {
    if (!song) {
      setState({ loading: false });
      return;
    }
    if (song.jianpu) {
      setState({ score: song.jianpu, loading: false });
      return;
    }
    if (!song.jianpuUrl) {
      setState({ loading: false });
      return;
    }

    const url = import.meta.env.BASE_URL + song.jianpuUrl;
    const cached = cache.get(url);
    if (cached) {
      setState({ score: cached, loading: false });
      return;
    }

    let alive = true;
    setState({ loading: true });
    fetchJianpu<JianpuScore>(url)
      .then((res) => {
        if (!alive) return;
        if ("imageUrl" in res) {
          setState({ loading: false });
          return;
        }
        cache.set(url, res);
        setState({ score: res, loading: false });
      })
      .catch(() => {
        if (alive) setState({ loading: false });
      });
    return () => {
      alive = false;
    };
  }, [song?.id, song?.jianpu, song?.jianpuUrl]);

  return { score: state.score, loading: state.loading };
}
