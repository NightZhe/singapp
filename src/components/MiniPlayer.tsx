import { useLocation, useNavigate } from "react-router-dom";
import { Music, Pause, Play } from "lucide-react";
import { usePlayer } from "../store/PlayerContext";

/** 全域懸浮迷你播放器:固定在 Bottom Navigation 上方,點擊展開單曲頁 */
export default function MiniPlayer() {
  const { current, isPlaying, time, duration, toggle } = usePlayer();
  const navigate = useNavigate();
  const location = useLocation();

  if (!current || location.pathname.startsWith("/song/")) return null;
  const progress = duration > 0 ? (time / duration) * 100 : 0;

  return (
    <div
      className="fixed inset-x-3 z-40"
      style={{ bottom: "calc(4.75rem + var(--safe-bottom))" }}
    >
      <button
        type="button"
        onClick={() => navigate(`/song/${current.id}`)}
        className="relative flex w-full items-center gap-3 overflow-hidden rounded-2xl
                   border border-slate-700/60 bg-slate-900/95 p-2.5 pr-3 text-left
                   shadow-xl shadow-black/40 backdrop-blur"
      >
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
                      bg-gradient-to-br ${current.gradient}`}
        >
          <Music size={18} className="text-white" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{current.title}</span>
          <span className="block truncate text-xs text-slate-400">{current.artist}</span>
        </span>
        <span
          role="button"
          onClick={(e) => {
            e.stopPropagation();
            toggle();
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full
                     bg-indigo-500 text-white active:scale-95"
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </span>
        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-slate-700">
          <span
            className="block h-full bg-indigo-400 transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </span>
      </button>
    </div>
  );
}
