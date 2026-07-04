export interface LrcLine {
  time: number; // 秒
  text: string;
}

const TIME_TAG = /\[(\d{1,2}):(\d{1,2})(?:[.:](\d{1,3}))?\]/g;

/** 解析 LRC 文字為依時間排序的歌詞行(一行多時間標籤會展開) */
export function parseLrc(lrc: string): LrcLine[] {
  const lines: LrcLine[] = [];
  for (const raw of lrc.split(/\r?\n/)) {
    const text = raw.replace(TIME_TAG, "").trim();
    for (const m of raw.matchAll(TIME_TAG)) {
      const min = Number(m[1]);
      const sec = Number(m[2]);
      const frac = m[3] ? Number(`0.${m[3]}`) : 0;
      lines.push({ time: min * 60 + sec + frac, text });
    }
  }
  return lines.sort((a, b) => a.time - b.time);
}

/** 回傳目前時間所在的歌詞行 index,找不到回傳 -1 */
export function activeLrcIndex(lines: LrcLine[], time: number): number {
  let idx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].time <= time) idx = i;
    else break;
  }
  return idx;
}
