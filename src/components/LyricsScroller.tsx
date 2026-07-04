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
      {lines.length === 0 && (
        <p className="text-slate-500">此曲目尚無歌詞</p>
      )}
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
