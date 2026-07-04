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

interface PlayerState {
  current: Song | null;
  isPlaying: boolean;
  time: number;
  duration: number;
  volume: number;
  playSong: (song: Song) => void;
  toggle: () => void;
  seek: (t: number) => void;
  setVolume: (v: number) => void;
}

const PlayerContext = createContext<PlayerState | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [current, setCurrent] = useState<Song | null>(null);
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

  const playSong = useCallback((song: Song) => {
    const audio = audioRef.current;
    if (!audio) return;
    const src = song.audioUrl ?? getLocalAudio(song.id);
    setCurrent(song);
    if (!src) {
      // 尚無音源(等待使用者選擇本機音檔):只切換目前曲目
      audio.pause();
      audio.removeAttribute("src");
      setIsPlaying(false);
      setTime(0);
      setDuration(0);
      return;
    }
    if (audio.src !== src) {
      audio.src = src;
      setTime(0);
      setDuration(0);
    }
    void audio.play().then(
      () => setIsPlaying(true),
      () => setIsPlaying(false)
    );
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    if (audio.paused) {
      void audio.play().then(() => setIsPlaying(true));
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  const seek = useCallback((t: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = t;
    setTime(t);
  }, []);

  const setVolume = useCallback((v: number) => {
    const audio = audioRef.current;
    if (audio) audio.volume = v;
    setVolumeState(v);
  }, []);

  const value = useMemo(
    () => ({ current, isPlaying, time, duration, volume, playSong, toggle, seek, setVolume }),
    [current, isPlaying, time, duration, volume, playSong, toggle, seek, setVolume]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
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
