import { useState } from "react";
import { useNavigate } from "react-router-dom";
import JianpuView from "../components/JianpuView";
import { SONGS } from "../data/songs";
import { usePlayer } from "../store/PlayerContext";
import { getLocalAudio } from "../store/localAudio";
import { INSTRUMENT_TRANSPOSE, transposeKey } from "../lib/jianpu";
import { Play, Pause } from "lucide-react";

/** 薩克斯風頁:單行簡譜 + Eb/Bb 移調(首調記譜 → 只需改變 1= 調號) */
export default function Saxophone() {
  const { current, isPlaying, playSong, toggle } = usePlayer();
  const navigate = useNavigate();
  const [songId, setSongId] = useState(SONGS[0].id);
  const [transposeId, setTransposeId] = useState<string>("concert");
  const song = SONGS.find((s) => s.id === songId) ?? SONGS[0];
  const semitones =
    INSTRUMENT_TRANSPOSE.find((t) => t.id === transposeId)?.semitones ?? 0;

  return (
    <div className="flex h-dvh flex-col pb-36" style={{ paddingTop: "var(--safe-top)" }}>
      <header className="px-4 py-3">
        <h1 className="text-lg font-bold">薩克斯風 · 簡譜</h1>
        {/* 曲目選擇 */}
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
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
        {/* 移調 UI */}
        <div className="mt-2.5 flex items-center gap-2">
          <span className="text-xs text-slate-500">移調</span>
          {INSTRUMENT_TRANSPOSE.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTransposeId(t.id)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition
                ${
                  t.id === transposeId
                    ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/50"
                    : "bg-slate-900 text-slate-400"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className="min-h-0 flex-1">
        <JianpuView
          score={song.jianpu}
          songId={song.id}
          mode="single"
          displayKey={song.jianpu ? transposeKey(song.jianpu.key, semitones) : undefined}
        />
      </div>

      <button
        type="button"
        onClick={() => {
          if (current?.id === song.id) return toggle();
          if (song.audioUrl || getLocalAudio(song.id)) return playSong(song);
          navigate(`/song/${song.id}`); // 無公開音源 → 到單曲頁選擇本機音檔
        }}
        className="mx-4 flex items-center justify-center gap-2 rounded-2xl bg-indigo-500
                   py-3 font-semibold text-white active:scale-[0.98]"
      >
        {current?.id === song.id && isPlaying ? (
          <>
            <Pause size={18} /> 暫停伴奏
          </>
        ) : (
          <>
            <Play size={18} /> 播放伴奏對照
          </>
        )}
      </button>
    </div>
  );
}
