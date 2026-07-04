import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MicVocal, Music2 } from "lucide-react";
import LyricsScroller from "../components/LyricsScroller";
import { SONGS } from "../data/songs";
import { usePlayer } from "../store/PlayerContext";
import { getLocalAudio } from "../store/localAudio";
import { useLyrics } from "../lib/useLyrics";

/** 唱歌頁:動態歌詞滿版顯示 + 人聲/伴奏切換提示 */
export default function Singing() {
  const { current, time, seek, playSong } = usePlayer();
  const navigate = useNavigate();
  const song = current ?? SONGS[0];
  const [vocalOn, setVocalOn] = useState(true);
  const { lrc, loading: lrcLoading } = useLyrics(song);

  return (
    <div
      className="flex h-dvh flex-col pb-36"
      style={{ paddingTop: "var(--safe-top)" }}
    >
      <header className="flex items-center justify-between px-4 py-3">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold">{song.title}</h1>
          <p className="truncate text-xs text-slate-400">{song.artist}</p>
        </div>
        {/* 人聲 / 伴奏 切換 */}
        <div className="flex rounded-full bg-slate-900 p-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => setVocalOn(true)}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 transition
              ${vocalOn ? "bg-indigo-500 text-white" : "text-slate-400"}`}
          >
            <MicVocal size={13} /> 人聲
          </button>
          <button
            type="button"
            onClick={() => setVocalOn(false)}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 transition
              ${!vocalOn ? "bg-indigo-500 text-white" : "text-slate-400"}`}
          >
            <Music2 size={13} /> 伴奏
          </button>
        </div>
      </header>

      {!vocalOn && (
        <p className="mx-4 mb-1 rounded-lg bg-slate-900/80 px-3 py-1.5 text-center text-xs text-amber-300">
          伴奏模式:公開音源若無獨立伴奏軌,將以原曲播放
        </p>
      )}

      <div className="min-h-0 flex-1">
        {lrcLoading ? (
          <p className="pt-16 text-center text-sm text-slate-500">
            正在從公開歌詞庫抓取歌詞…
          </p>
        ) : (
          <LyricsScroller lrc={lrc} time={time} onSeek={seek} size="lg" />
        )}
      </div>

      {!current && (
        <button
          type="button"
          onClick={() =>
            song.audioUrl || getLocalAudio(song.id)
              ? playSong(song)
              : navigate(`/song/${song.id}`) // 無公開音源 → 到單曲頁選擇本機音檔
          }
          className="mx-4 rounded-2xl bg-indigo-500 py-3 font-semibold text-white active:scale-[0.98]"
        >
          開始播放並跟唱
        </button>
      )}
    </div>
  );
}
