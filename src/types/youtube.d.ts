/** YouTube IFrame Player API 最小型別定義(僅涵蓋本專案用到的介面) */
interface YTPlayerLike {
  loadVideoById(videoId: string): void;
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  setVolume(volume: number): void;
}

interface Window {
  YT?: {
    Player: new (el: HTMLElement, options: Record<string, unknown>) => YTPlayerLike;
    PlayerState: { PLAYING: number; PAUSED: number; ENDED: number; BUFFERING: number };
  };
  onYouTubeIframeAPIReady?: () => void;
}
