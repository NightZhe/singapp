import { useRef, useState, type TouchEvent } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { parseJianpuLine, type JianpuToken } from "../lib/jianpu";
import type { JianpuScore } from "../data/songs";

interface Props {
  score: JianpuScore;
  /** single = 薩克斯風單行;double = 鋼琴雙行(旋律+伴奏) */
  mode?: "single" | "double";
  /** 顯示用調號(移調後),未提供則用 score.key */
  displayKey?: string;
}

function Token({ t }: { t: JianpuToken }) {
  if (t.type === "bar") return <span className="mx-1 text-slate-600">|</span>;
  if (t.type === "dash") return <span className="mx-1 text-slate-300">–</span>;
  const octave = t.octave ?? 0;
  return (
    <span className="relative mx-1 inline-flex flex-col items-center">
      {/* 高音點 */}
      <span className="h-2 text-[0.5em] leading-none text-slate-300">
        {octave > 0 ? "•".repeat(octave) : " "}
      </span>
      <span
        className={`leading-none ${t.type === "rest" ? "text-slate-500" : "text-slate-100"}
          ${t.underline ? "border-b border-slate-300" : ""}
          ${(t.underline ?? 0) > 1 ? "border-b-2" : ""}`}
      >
        {t.degree}
      </span>
      {/* 低音點 */}
      <span className="h-2 text-[0.5em] leading-none text-slate-300">
        {octave < 0 ? "•".repeat(-octave) : " "}
      </span>
    </span>
  );
}

/** 簡譜渲染:支援雙指縮放與按鈕縮放,方便行動裝置看譜 */
export default function JianpuView({ score, mode = "single", displayKey }: Props) {
  const [scale, setScale] = useState(1);
  const pinchStart = useRef<{ dist: number; scale: number } | null>(null);

  const clamp = (v: number) => Math.min(2.2, Math.max(0.7, v));

  const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchStart.current = { dist: d, scale };
    }
  };
  const onTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2 && pinchStart.current) {
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setScale(clamp((d / pinchStart.current.dist) * pinchStart.current.scale));
    }
  };

  const rows: [string, string?][] =
    mode === "double" && score.pianoLines
      ? score.pianoLines
      : score.lines.map((l) => [l]);

  return (
    <div className="flex h-full flex-col">
      {/* 譜表資訊 + 縮放控制 */}
      <div className="flex items-center justify-between px-4 py-2 text-sm text-slate-400">
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-indigo-500/15 px-2 py-0.5 font-semibold text-indigo-300">
            1={displayKey ?? score.key}
          </span>
          <span>{score.timeSignature}</span>
          <span>♩={score.tempo}</span>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="縮小"
            onClick={() => setScale((s) => clamp(s - 0.15))}
            className="rounded-lg bg-slate-800 p-2 text-slate-300 active:scale-95"
          >
            <ZoomOut size={16} />
          </button>
          <button
            type="button"
            aria-label="放大"
            onClick={() => setScale((s) => clamp(s + 0.15))}
            className="rounded-lg bg-slate-800 p-2 text-slate-300 active:scale-95"
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>

      <div
        className="no-scrollbar flex-1 overflow-auto px-4 pb-6"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        style={{ touchAction: "pan-y" }}
      >
        <div
          className="origin-top-left font-mono"
          style={{ fontSize: `${1.35 * scale}rem` }}
        >
          {rows.map(([melody, accomp], i) => (
            <div
              key={i}
              className={`mb-4 rounded-xl px-2 py-3 ${
                mode === "double" ? "bg-slate-900/60" : ""
              }`}
            >
              <div className="whitespace-nowrap">
                {parseJianpuLine(melody).map((t, j) => (
                  <Token key={j} t={t} />
                ))}
              </div>
              {accomp && (
                <div className="mt-2 whitespace-nowrap border-t border-slate-800 pt-2 opacity-80">
                  {parseJianpuLine(accomp).map((t, j) => (
                    <Token key={j} t={t} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
