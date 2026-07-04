import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronDown,
  FolderOpen,
  Music,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2
} from "lucide-react";
import LyricsScroller from "../components/LyricsScroller";
import JianpuView from "../components/JianpuView";
import { getSong } from "../data/songs";
import { formatTime, usePlayer } from "../store/PlayerContext";
import { getLocalAudio, setLocalAudio } from "../store/localAudio";
import { useLyrics } from "../lib/useLyrics";

type Tab = "lyrics" | "jianpu";

/** 單曲播放頁:整合播放器 + 歌詞 / 簡譜切換 */
export default function SongPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const song = getSong(id);
  const { current, isPlaying, time, duration, volume, playSong, toggle, seek, setVolume } =
    usePlayer();
  const [tab, setTab] = useState<Tab>("lyrics");
  const [localReady, setLocalReady] = useState(false);
  const { lrc, loading: lrcLoading, error: lrcError } = useLyrics(song);
  const hasAudio =
    Boolean(song?.audioUrl) || localReady || Boolean(song && getLocalAudio(song.id));

  // 進入頁面時若尚未載入此曲,自動開始播放
  useEffect(() => {
    if (song && current?.id !== song.id) playSong(song);
  }, [song, current?.id, playSong]);

  if (!song) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-3 text-slate-400">
        找不到這首歌
        <button
          type="button"
          onClick={() => navigate("/")}
          className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white"
        >
          回首頁
        </button>
      </div>
    );
  }

  const progress = duration > 0 ? (time / duration) * 100 : 0;

  return (
    <div className="flex h-dvh flex-col" style={{ paddingTop: "var(--safe-top)" }}>
      {/* 頁首 */}
      <header className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          aria-label="返回"
          onClick={() => navigate(-1)}
          className="rounded-full bg-slate-900 p-2 text-slate-300 active:scale-95"
        >
          <ChevronDown size={20} />
        </button>
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${song.gradient}`}
        >
          <Music size={16} className="text-white" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-bold">{song.title}</h1>
          <p className="truncate text-xs text-slate-400">{song.artist}</p>
        </div>
      </header>

      {/* 歌詞 / 簡譜 切換 Tab */}
      <div className="mx-4 flex rounded-xl bg-slate-900 p-1 text-sm font-medium">
        {(
          [
            ["lyrics", "動態歌詞"],
            ["jianpu", "簡譜"]
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 rounded-lg py-2 transition
              ${tab === key ? "bg-indigo-500 text-white shadow" : "text-slate-400"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 內容區 */}
      <div className="min-h-0 flex-1 pt-2">
        {tab === "lyrics" ? (
          lrcLoading ? (
            <p className="pt-16 text-center text-sm text-slate-500">
              正在從公開歌詞庫抓取歌詞…
            </p>
          ) : lrcError ? (
            <p className="px-8 pt-16 text-center text-sm text-slate-500">
              歌詞抓取失敗,請確認網路後重新進入此頁
            </p>
          ) : (
            <LyricsScroller lrc={lrc} time={time} onSeek={seek} />
          )
        ) : (
          <JianpuView score={song.jianpu} songId={song.id} mode="single" />
        )}
      </div>

      {/* 無公開音源:選擇本機音檔 */}
      {!hasAudio && (
        <label
          className="mx-4 mb-2 flex cursor-pointer items-center justify-center gap-2
                     rounded-2xl border border-dashed border-slate-600 bg-slate-900/70
                     py-3 text-sm font-medium text-indigo-300 active:scale-[0.98]"
        >
          <FolderOpen size={16} />
          此曲目無公開音源,點此選擇本機音檔播放
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setLocalAudio(song.id, URL.createObjectURL(file));
              setLocalReady(true);
              playSong(song);
            }}
          />
        </label>
      )}

      {/* 播放控制列 */}
      <div
        className="border-t border-slate-800 bg-slate-950/95 px-5 pt-3 backdrop-blur"
        style={{ paddingBottom: "calc(var(--safe-bottom) + 1rem)" }}
      >
        {/* 進度條 */}
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={time}
          onChange={(e) => seek(Number(e.target.value))}
          className="w-full"
          style={{ "--fill": `${progress}%` } as React.CSSProperties}
          aria-label="播放進度"
        />
        <div className="mt-1 flex justify-between text-[11px] tabular-nums text-slate-500">
          <span>{formatTime(time)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* 控制按鈕 */}
        <div className="mt-1 flex items-center justify-center gap-8">
          <button
            type="button"
            aria-label="倒退 10 秒"
            onClick={() => seek(Math.max(0, time - 10))}
            className="text-slate-300 active:scale-90"
          >
            <RotateCcw size={24} />
          </button>
          <button
            type="button"
            aria-label={isPlaying ? "暫停" : "播放"}
            onClick={toggle}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500
                       text-white shadow-lg shadow-indigo-500/30 active:scale-95"
          >
            {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
          </button>
          <button
            type="button"
            aria-label="快轉 10 秒"
            onClick={() => seek(Math.min(duration, time + 10))}
            className="text-slate-300 active:scale-90"
          >
            <RotateCw size={24} />
          </button>
        </div>

        {/* 音量 */}
        <div className="mt-3 flex items-center gap-3">
          <Volume2 size={16} className="text-slate-500" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="flex-1"
            style={{ "--fill": `${volume * 100}%` } as React.CSSProperties}
            aria-label="音量"
          />
        </div>
      </div>
    </div>
  );
}
