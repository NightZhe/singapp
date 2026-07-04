/**
 * 本機音檔對照表:無公開音源的曲目由使用者自選音檔播放。
 * Object URL 僅存在於本次工作階段,重新整理後需重新選擇。
 */
const map = new Map<string, string>();

export function setLocalAudio(songId: string, objectUrl: string): void {
  const old = map.get(songId);
  if (old) URL.revokeObjectURL(old);
  map.set(songId, objectUrl);
}

export function getLocalAudio(songId: string): string | undefined {
  return map.get(songId);
}
