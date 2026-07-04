import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import type { Song } from "../data/songs";
import { getLocalAudio } from "./localAudio";
import { loadYouTubeApi, resolveYoutubeId } from "../lib/youtube";

type SourceType = "audio" | "youtube" | null;

interface PlayerState {
  current: Song | null;
  isPlaying: boolean;
  time: number;
  duration: number;
  volume: number;
  /** 目前音源類型:audio(音檔)/ youtube(嵌入播放)/ null(尚無音源) */
  sourceType: SourceType;
  playSong: (song: Song) => void;
  toggle: () => void;
  seek: (t: number) => void;
  setVolume: (v: number) => void;
}

const PlayerContext = createContext<PlayerState | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytRef = useRef<YTPlayerLike | null>(null);
  const ytHostRef = useRef<HTMLDivElement | null>(null);
  const ytIdRef = useRef<string | null>(null);
  const ytCreating = useRef<Promise<void> | null>(null);
  const volumeRef = useRef(0.8);

  const [current, setCurrent] = useState<Song | null>(null);
  const [sourceType, setSourceType] = useState<SourceType>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);

  if (!audioRef.current && typeof Audio !== "undefined") {
    audioRef.current = new Audio();
    audioRef.current.preload = "metadata";
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnd = () => setIsPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  // YouTube 播放進度輪詢(IFrame API 沒有 timeupdate 事件)
  useEffect(() => {
    if (sourceType !== "youtube") return;
    const iv = setInterval(() => {
      const p = ytRef.current;
      if (!p) return;
      try {
        setTime(p.getCurrentTime() || 0);
        const d = p.getDuration() || 0;
        if (d > 0) setDuration(d);
      } catch {
        /* player 尚未就緒 */
      }
    }, 500);
    return () => clearInterval(iv);
  }, [sourceType]);

  /** 建立(或重用)全域 YouTube Player 並載入指定影片 */
  const ensureYt = useCallback(async (videoId: string) => {
    if (ytRef.current) {
      if (ytIdRef.current !== videoId) {
        ytIdRef.current = videoId;
        ytRef.current.loadVideoById(videoId);
      } else {
        ytRef.current.playVideo();
      }
      return;
    }
    if (!ytCreating.current) {
      ytIdRef.current = videoId;
      ytCreating.current = loadYouTubeApi().then(
        (YTApi) =>
          new Promise<void>((resolve) => {
            const player = new YTApi.Player(ytHostRef.current!, {
              width: "100%",
              height: "100%",
              videoId,
              playerVars: { playsinline: 1, rel: 0 },
              events: {
                onReady: () => {
                  player.setVolume(Math.round(volumeRef.current * 100));
                  resolve();
                },
                onStateChange: (e: { data: number }) => {
                  const S = window.YT!.PlayerState;
                  if (e.data === S.PLAYING) setIsPlaying(true);
                  else if (e.data === S.PAUSED || e.data === S.ENDED) setIsPlaying(false);
                }
              }
            });
            ytRef.current = player;
          })
      );
    }
    await ytCreating.current;
    // 建立期間若已切換曲目,補載正確影片(await 後 ytRef 已由 onReady 流程填入)
    const player = ytRef.current as YTPlayerLike | null;
    if (player && ytIdRef.current !== videoId) {
      ytIdRef.current = videoId;
      player.loadVideoById(videoId);
    }
  }, []);

  const playSong = useCallback(
    (song: Song) => {
      setCurrent(song);
      const audio = audioRef.current;
      const ytId = resolveYoutubeId(song);

      if (ytId) {
        // YouTube 來源:停掉音檔後端
        if (audio) {
          audio.pause();
          audio.removeAttribute("src");
        }
        if (ytIdRef.current !== ytId) {
          setTime(0);
          setDuration(0);
        }
        setSourceType("youtube");
        void ensureYt(ytId).then(() => ytRef.current?.playVideo());
        return;
      }

      // 音檔來源:停掉 YouTube 後端
      try {
        ytRef.current?.pauseVideo();
      } catch {
        /* ignore */
      }
      if (!audio) return;
      const src = song.audioUrl ?? getLocalAudio(song.id);
      if (!src) {
        // 尚無音源(等待使用者選擇本機音檔或貼 YouTube 連結)
        audio.pause();
        audio.removeAttribute("src");
        setSourceType(null);
        setIsPlaying(false);
        setTime(0);
        setDuration(0);
        return;
      }
      setSourceType("audio");
      if (audio.src !== src) {
        audio.src = src;
        setTime(0);
        setDuration(0);
      }
      void audio.play().then(
        () => setIsPlaying(true),
        () => setIsPlaying(false)
      );
    },
    [ensureYt]
  );

  const toggle = useCallback(() => {
    if (sourceType === "youtube") {
      const p = ytRef.current;
      const S = window.YT?.PlayerState;
      if (!p || !S) return;
      if (p.getPlayerState() === S.PLAYING) p.pauseVideo();
      else p.playVideo();
      return;
    }
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    if (audio.paused) {
      void audio.play().then(() => setIsPlaying(true));
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [sourceType]);

  const seek = useCallback(
    (t: number) => {
      if (sourceType === "youtube") {
        ytRef.current?.seekTo(t, true);
        setTime(t);
        return;
      }
      const audio = audioRef.current;
      if (!audio) return;
      audio.currentTime = t;
      setTime(t);
    },
    [sourceType]
  );

  const setVolume = useCallback((v: number) => {
    volumeRef.current = v;
    if (audioRef.current) audioRef.current.volume = v;
    try {
      ytRef.current?.setVolume(Math.round(v * 100));
    } catch {
      /* ignore */
    }
    setVolumeState(v);
  }, []);

  const value = useMemo(
    () => ({
      current,
      isPlaying,
      time,
      duration,
      volume,
      sourceType,
      playSong,
      toggle,
      seek,
      setVolume
    }),
    [current, isPlaying, time, duration, volume, sourceType, playSong, toggle, seek, setVolume]
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
      {/* 全域 YouTube 浮動播放器:跨頁面持續播放;依 YouTube 條款,播放中的影片保持可見 */}
      <div
        className={`fixed right-3 z-50 overflow-hidden rounded-xl border border-slate-700
                    bg-black shadow-2xl shadow-black/60 transition-all duration-300
                    ${
                      sourceType === "youtube"
                        ? "w-48 opacity-100"
                        : "pointer-events-none w-0 opacity-0"
                    }`}
        style={{ bottom: "calc(9.5rem + var(--safe-bottom))", aspectRatio: "16 / 9" }}
      >
        <div ref={ytHostRef} className="h-full w-full" />
      </div>
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerState {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer 必須在 <PlayerProvider> 內使用");
  return ctx;
}

export const formatTime = (t: number): string => {
  if (!Number.isFinite(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};
