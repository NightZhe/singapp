import { useEffect, useMemo, useRef } from "react";
import { activeLrcIndex, parseLrc } from "../lib/lrc";

interface Props {
  lrc: string;
  time: number;
  onSeek?: (t: number) => void;
  /** lg = 唱歌頁滿版大字模式 */
  size?: "md" | "lg";
}

/** 動態歌詞:目前行高亮並自動滾動置中,點擊任一行可跳播 */
export default function LyricsScroller({ lrc, time, onSeek, size = "md" }: Props) {
  const lines = useMemo(() => parseLrc(lrc), [lrc]);
  // 來源只有純文字歌詞(無時間標籤)時,退化為靜態顯示
  const plainLines = useMemo(
    () =>
      lines.length === 0 && lrc.trim()
        ? lrc.split(/\r?\n/).filter((l) => l.trim())
        : null,
    [lines, lrc]
  );
  const active = activeLrcIndex(lines, time);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (active < 0) return;
    const el = containerRef.current?.children[active] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [active]);

  const base =
    size === "lg"
      ? "text-2xl leading-relaxed py-2.5"
      : "text-lg leading-relaxed py-1.5";

  return (
    <div
      ref={containerRef}
      className="no-scrollbar h-full overflow-y-auto scroll-smooth px-6 py-[40vh] text-center"
    >
      {lines.length === 0 && !plainLines && (
        <p className="text-slate-500">此曲目尚無歌詞</p>
      )}
      {plainLines?.map((text, i) => (
        <p key={i} className={`${base} font-medium text-slate-300`}>
          {text}
        </p>
      ))}
      {lines.map((line, i) => (
        <p
          key={`${line.time}-${i}`}
          onClick={() => onSeek?.(line.time)}
          className={`${base} cursor-pointer font-medium transition-all duration-300
            ${
              i === active
                ? "scale-105 text-white drop-shadow-[0_0_12px_rgba(129,140,248,0.6)]"
                : "text-slate-500 hover:text-slate-300"
            }`}
        >
          {line.text || "♪"}
        </p>
      ))}
    </div>
  );
}
