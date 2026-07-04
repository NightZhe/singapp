import { Link, useNavigate } from "react-router-dom";
import { Mic, Wind, Piano, Play, Flame } from "lucide-react";
import Carousel from "../components/Carousel";
import { SONGS } from "../data/songs";
import { usePlayer } from "../store/PlayerContext";

const CATEGORIES = [
  { to: "/singing", label: "唱歌", desc: "動態歌詞", icon: Mic, color: "bg-rose-500/15 text-rose-400" },
  { to: "/saxophone", label: "薩克斯風", desc: "單行簡譜", icon: Wind, color: "bg-amber-500/15 text-amber-400" },
  { to: "/piano", label: "鋼琴", desc: "雙行簡譜", icon: Piano, color: "bg-sky-500/15 text-sky-400" }
];

export default function Home() {
  const { playSong } = usePlayer();
  const navigate = useNavigate();

  return (
    <div className="pb-40">
      <header className="px-4 pb-4 pt-6" style={{ paddingTop: "calc(var(--safe-top) + 1.5rem)" }}>
        <h1 className="text-2xl font-bold">SingApp 樂譜隨行</h1>
        <p className="mt-1 text-sm text-slate-400">最新抓取的公開曲目與樂譜,離線也能練</p>
      </header>

      <Carousel songs={SONGS} />

      {/* 樂器分類入口 */}
      <section className="mt-6 px-4">
        <h2 className="mb-3 text-base font-semibold text-slate-200">分類入口</h2>
        <div className="grid grid-cols-3 gap-3">
          {CATEGORIES.map(({ to, label, desc, icon: Icon, color }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-2 rounded-2xl border border-slate-800
                         bg-slate-900/60 py-4 transition active:scale-95"
            >
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
                <Icon size={22} />
              </span>
              <span className="text-sm font-medium">{label}</span>
              <span className="text-[11px] text-slate-500">{desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 熱門歌曲列表 */}
      <section className="mt-6 px-4">
        <h2 className="mb-3 flex items-center gap-1.5 text-base font-semibold text-slate-200">
          <Flame size={18} className="text-orange-400" /> 熱門歌曲
        </h2>
        <ul className="space-y-2">
          {SONGS.map((song, i) => (
            <li
              key={song.id}
              onClick={() => {
                playSong(song);
                navigate(`/song/${song.id}`);
              }}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-800
                         bg-slate-900/60 p-3 transition active:scale-[0.98]"
            >
              <span className="w-5 text-center text-sm font-bold text-slate-500">{i + 1}</span>
              <span
                className={`h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br ${song.gradient}`}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{song.title}</span>
                <span className="block truncate text-xs text-slate-400">
                  {song.artist} · {song.tags.join("、")}
                </span>
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-indigo-300">
                <Play size={15} className="ml-0.5" />
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
