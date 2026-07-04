/** 簡譜(首調唱名)相關工具:移調 = 改變「1=」的調號標示 */

export const KEYS = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"] as const;
export type KeyName = (typeof KEYS)[number];

export function transposeKey(key: string, semitones: number): string {
  const idx = KEYS.indexOf(key as KeyName);
  if (idx < 0) return key;
  return KEYS[(idx + (semitones % 12) + 12) % 12];
}

/** 管樂器記譜移調:記譜調 = 音樂會調 + 偏移半音數 */
export const INSTRUMENT_TRANSPOSE = [
  { id: "concert", label: "C 調(原調)", semitones: 0 },
  { id: "bb", label: "Bb 調(次中音)", semitones: 2 },
  { id: "eb", label: "Eb 調(中音)", semitones: 9 }
] as const;

export interface JianpuToken {
  type: "note" | "rest" | "dash" | "bar";
  /** 1–7,rest 為 0 */
  degree?: number;
  /** 高低八度點:+1 高音點、-1 低音點 */
  octave?: number;
  /** 底線數(時值減半記號) */
  underline?: number;
}

/**
 * 解析簡譜字串,例:"5 3' 2, 1_ 0 - |"
 *   '  高八度點   ,  低八度點   _  一條底線   __ 兩條底線
 */
export function parseJianpuLine(line: string): JianpuToken[] {
  return line
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((tok): JianpuToken => {
      if (tok === "|") return { type: "bar" };
      if (tok === "-") return { type: "dash" };
      const m = tok.match(/^([0-7])('*)(,*)(_*)$/);
      if (!m) return { type: "rest", degree: 0 };
      const degree = Number(m[1]);
      return {
        type: degree === 0 ? "rest" : "note",
        degree,
        octave: m[2].length - m[3].length,
        underline: m[4].length
      };
    });
}
