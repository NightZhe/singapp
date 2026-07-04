import { useEffect, useState } from "react";
import { RotateCw, Minimize2 } from "lucide-react";
import JianpuView from "../components/JianpuView";
import { SONGS } from "../data/songs";
import { useJianpu } from "../lib/useJianpu";

/** 鋼琴頁:雙行簡譜(旋律+伴奏),支援一鍵切換橫向全螢幕看譜 */
export default function Piano() {
  const [songId, setSongId] = useState(SONGS[0].id);
  const [fullscreen, setFullscreen] = useState(false);
  const song = SONGS.find((s) => s.id === songId) ?? SONGS[0];
  const { score, loading: scoreLoading } = useJianpu(song);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const enterLandscape = async () => {
    try {
      await document.documentElement.requestFullscreen();
      // Screen Orientation Lock 目前僅 Android Chrome 等支援,iOS 需手動轉向
      const orientation = screen.orientation as ScreenOrientation & {
        lock?: (o: string) => Promise<void>;
      };
      await orientation.lock?.("landscape");
    } catch {
      /* 不支援時維持全螢幕直向,使用者可自行旋轉裝置 */
    }
  };

  const exitLandscape = async () => {
    try {
      (screen.orientation as ScreenOrientation & { unlock?: () => void }).unlock?.();
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className={`flex h-dvh flex-col ${fullscreen ? "bg-slate-950" : "pb-36"}`}
      style={{ paddingTop: fullscreen ? 0 : "var(--safe-top)" }}
    >
      <header className="flex items-center justify-between px-4 py-3">
        <div>
          <h1 className="text-lg font-bold">鋼琴 · 雙行簡譜</h1>
          {!fullscreen && (
            <p className="text-xs text-slate-500">上行旋律 / 下行伴奏</p>
          )}
        </div>
        {fullscreen ? (
          <button
            type="button"
            onClick={exitLandscape}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200"
          >
            <Minimize2 size={14} /> 離開橫向
          </button>
        ) : (
          <button
            type="button"
            onClick={enterLandscape}
            className="flex items-center gap-1.5 rounded-xl bg-sky-500/15 px-3 py-2
                       text-xs font-medium text-sky-300 ring-1 ring-sky-400/40"
          >
            <RotateCw size={14} /> 橫向看譜
          </button>
        )}
      </header>

      {!fullscreen && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2">
          {SONGS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSongId(s.id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition
                ${s.id === songId ? "bg-indigo-500 text-white" : "bg-slate-900 text-slate-400"}`}
            >
              {s.title}
            </button>
          ))}
        </div>
      )}

      <div className="min-h-0 flex-1">
        {scoreLoading ? (
          <p className="pt-12 text-center text-sm text-slate-500">簡譜載入中…</p>
        ) : (
          <JianpuView score={score} songId={song.id} mode="double" />
        )}
      </div>
    </div>
  );
}
