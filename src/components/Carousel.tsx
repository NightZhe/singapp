import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import type { Song } from "../data/songs";
import { usePlayer } from "../store/PlayerContext";

/** 首頁輪播圖:水平 snap 滾動 + 自動輪播 */
export default function Carousel({ songs }: { songs: Song[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  const { playSong } = usePlayer();

  useEffect(() => {
    const timer = setInterval(() => {
      const next = (index + 1) % songs.length;
      const el = ref.current;
      el?.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
      setIndex(next);
    }, 4000);
    return () => clearInterval(timer);
  }, [index, songs.length]);

  return (
    <div className="relative">
      <div
        ref={ref}
        onScroll={(e) => {
          const el = e.currentTarget;
          setIndex(Math.round(el.scrollLeft / el.clientWidth));
        }}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
      >
        {songs.map((song) => (
          <div key={song.id} className="w-full shrink-0 snap-center px-4">
            <div
              onClick={() => {
                playSong(song);
                navigate(`/song/${song.id}`);
              }}
              className={`relative flex h-44 cursor-pointer flex-col justify-end overflow-hidden
                          rounded-3xl bg-gradient-to-br p-5 ${song.gradient}`}
            >
              <span className="absolute right-4 top-4 rounded-full bg-black/25 px-3 py-1
                               text-xs font-medium text-white backdrop-blur">
                最新抓取
              </span>
              <h3 className="text-xl font-bold text-white drop-shadow">{song.title}</h3>
              <p className="text-sm text-white/80">{song.artist}</p>
              <span className="absolute bottom-4 right-4 flex h-11 w-11 items-center
                               justify-center rounded-full bg-white/90 text-slate-900 shadow-lg">
                <Play size={18} className="ml-0.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-center gap-1.5">
        {songs.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300
              ${i === index ? "w-5 bg-indigo-400" : "w-1.5 bg-slate-700"}`}
          />
        ))}
      </div>
    </div>
  );
}
