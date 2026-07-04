import { useEffect, useRef, useState, type TouchEvent } from "react";
import { ImagePlus, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import { parseJianpuLine, transposeToken, type JianpuToken } from "../lib/jianpu";
import { activeLrcIndex, type LrcLine } from "../lib/lrc";
import type { JianpuScore } from "../data/songs";

interface Props {
  /** 內建簡譜資料;省略時進入「公開簡譜圖片」模式 */
  score?: JianpuScore;
  /** 圖片模式時用來持久化圖片網址(localStorage) */
  songId?: string;
  /** single = 薩克斯風單行;double = 鋼琴雙行(旋律+伴奏) */
  mode?: "single" | "double";
  /** 顯示用調號(移調後),未提供則用 score.key */
  displayKey?: string;
  /** 級數移調:直接改寫音符數字(例:Eb 調 -2 → 5 變 3) */
  degreeShift?: number;
  /** 移調狀態標示(顯示於譜表資訊列) */
  shiftLabel?: string;
  /** 每行簡譜對應的歌詞(含 LRC 時間軸),逐字對位到音符下方(僅 single 模式) */
  timedLyrics?: LrcLine[];
  /** 目前播放秒數:提供後簡譜隨播放動態跑(行高亮 + 音符節拍推進 + 自動捲動) */
  time?: number;
}

function Token({
  t,
  lyric,
  lyricSlot,
  active
}: {
  t: JianpuToken;
  lyric?: string;
  lyricSlot?: boolean;
  active?: boolean;
}) {
  if (t.type === "bar") return <span className="mx-1 text-slate-600">|</span>;
  if (t.type === "dash") return <span className="mx-1 text-slate-300">–</span>;
  const octave = t.octave ?? 0;
  return (
    <span className="relative mx-1 inline-flex flex-col items-center">
      {/* 高音點 */}
      <span className="h-2 text-[0.5em] leading-none text-slate-300">
        {octave > 0 ? "•".repeat(octave) : " "}
      </span>
      <span
        className={`leading-none transition-colors duration-150
          ${
            active
              ? "scale-110 text-indigo-300 drop-shadow-[0_0_10px_rgba(129,140,248,0.9)]"
              : t.type === "rest"
                ? "text-slate-500"
                : "text-slate-100"
          }
          ${t.underline ? "border-b border-slate-300" : ""}
          ${(t.underline ?? 0) > 1 ? "border-b-2" : ""}`}
      >
        {t.degree}
      </span>
      {/* 低音點 */}
      <span className="h-2 text-[0.5em] leading-none text-slate-300">
        {octave < 0 ? "•".repeat(-octave) : " "}
      </span>
      {/* 歌詞逐字對位 */}
      {lyricSlot && (
        <span
          className={`mt-1 text-[0.55em] leading-none transition-colors duration-150
            ${active ? "font-bold text-white" : "text-slate-400"}`}
        >
          {lyric ?? " "}
        </span>
      )}
    </span>
  );
}

/** 各記號佔的拍數：音符依底線減半、長音線與休止符 1 拍、小節線 0 拍 */
const tokenBeats = (t: JianpuToken): number =>
  t.type === "bar" ? 0 : t.type === "note" ? 1 / 2 ** (t.underline ?? 0) : 1;

const imgKey = (songId: string) => `jianpu-img-${songId}`;

/** 簡譜渲染:內建資料或公開圖片皆可,支援雙指縮放、級數移調與歌詞對位 */
export default function JianpuView({
  score,
  songId,
  mode = "single",
  displayKey,
  degreeShift = 0,
  shiftLabel,
  timedLyrics,
  time
}: Props) {
  const [scale, setScale] = useState(1);
  const pinchStart = useRef<{ dist: number; scale: number } | null>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [imageUrl, setImageUrl] = useState(() =>
    songId ? localStorage.getItem(imgKey(songId)) ?? "" : ""
  );
  const [draft, setDraft] = useState("");

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

  const saveImage = (url: string) => {
    setImageUrl(url);
    if (songId) {
      if (url) localStorage.setItem(imgKey(songId), url);
      else localStorage.removeItem(imgKey(songId));
    }
  };

  const rows: [string, string?][] = score
    ? mode === "double" && score.pianoLines
      ? score.pianoLines
      : score.lines.map((l) => [l])
    : [];

  // 動態跑譜:目前播放時間對應的簡譜行(與歌詞行逐一配對)
  const activeLine =
    timedLyrics && timedLyrics.length > 0 && time !== undefined
      ? activeLrcIndex(timedLyrics, time)
      : -1;

  // 當前行自動捲動置中
  useEffect(() => {
    if (activeLine < 0 || activeLine >= rows.length) return;
    lineRefs.current[activeLine]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeLine, rows.length]);

  /** 解析 + 級數移調 + 歌詞逐字對位;當前行再依節拍推進音符高亮 */
  const renderTokens = (line: string, lyric?: string, lineIdx?: number) => {
    const tokens = parseJianpuLine(line).map((t) => transposeToken(t, degreeShift));
    const chars = lyric ? Array.from(lyric.replace(/\s+/g, "")) : [];

    // 依 LRC 行起始時間 + 速度(♩=tempo)推算目前唱到哪個音符
    let activeTokenIdx = -1;
    if (
      lineIdx !== undefined &&
      lineIdx === activeLine &&
      score &&
      time !== undefined &&
      timedLyrics
    ) {
      const beatDur = 60 / (score.tempo || 80);
      const elapsedBeats = (time - timedLyrics[activeLine].time) / beatDur;
      let acc = 0;
      tokens.forEach((t, idx) => {
        if (t.type === "note" && acc <= elapsedBeats) activeTokenIdx = idx;
        acc += tokenBeats(t);
      });
    }

    let ci = 0;
    return tokens.map((t, j) => (
      <Token
        key={j}
        t={t}
        lyric={t.type === "note" ? chars[ci++] : undefined}
        lyricSlot={chars.length > 0}
        active={j === activeTokenIdx}
      />
    ));
  };

  return (
    <div className="flex h-full flex-col">
      {/* 譜表資訊 + 縮放控制 */}
      <div className="flex items-center justify-between px-4 py-2 text-sm text-slate-400">
        <div className="flex items-center gap-3">
          {score ? (
            <>
              <span className="rounded-md bg-indigo-500/15 px-2 py-0.5 font-semibold text-indigo-300">
                1={displayKey ?? score.key}
              </span>
              <span>{score.timeSignature}</span>
              <span>♩={score.tempo}</span>
              {shiftLabel && (
                <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-300">
                  {shiftLabel}指法
                </span>
              )}
            </>
          ) : (
            <span className="text-xs">公開簡譜圖片模式</span>
          )}
        </div>
        <div className="flex gap-1">
          {!score && imageUrl && (
            <button
              type="button"
              aria-label="移除圖片"
              onClick={() => saveImage("")}
              className="rounded-lg bg-slate-800 p-2 text-rose-300 active:scale-95"
            >
              <Trash2 size={16} />
            </button>
          )}
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
        {score ? (
          <div className="origin-top-left font-mono" style={{ fontSize: `${1.35 * scale}rem` }}>
            {rows.map(([melody, accomp], i) => (
              <div
                key={i}
                ref={(el) => {
                  lineRefs.current[i] = el;
                }}
                className={`mb-4 rounded-xl px-2 py-3 transition-colors duration-300 ${
                  i === activeLine
                    ? "bg-indigo-500/10 ring-1 ring-indigo-400/40"
                    : mode === "double"
                      ? "bg-slate-900/60"
                      : ""
                }`}
              >
                <div className="whitespace-nowrap">
                  {renderTokens(
                    melody,
                    mode === "single" ? timedLyrics?.[i]?.text : undefined,
                    i
                  )}
                </div>
                {accomp && (
                  <div className="mt-2 whitespace-nowrap border-t border-slate-800 pt-2 opacity-80">
                    {renderTokens(accomp)}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt="簡譜"
            className="rounded-xl bg-white"
            style={{ width: `${100 * scale}%`, maxWidth: "none" }}
            onError={() => saveImage("")}
          />
        ) : (
          /* 尚無簡譜:貼上公開來源的簡譜圖片網址 */
          <div className="mt-6 rounded-2xl border border-dashed border-slate-700 p-5 text-center">
            <ImagePlus size={28} className="mx-auto text-slate-500" />
            <p className="mt-2 text-sm text-slate-300">此曲目尚無內建簡譜</p>
            <p className="mt-1 text-xs text-slate-500">
              可貼上公開簡譜圖片網址(僅儲存連結於本機,請留意來源授權)
            </p>
            <div className="mt-3 flex gap-2">
              <input
                type="url"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="https://…/score.png"
                className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900
                           px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600
                           focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                disabled={!draft.trim()}
                onClick={() => saveImage(draft.trim())}
                className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white
                           disabled:opacity-40"
              >
                載入
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
