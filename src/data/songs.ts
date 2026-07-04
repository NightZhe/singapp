/** 內建示範曲目:音檔採用 SoundHelix 公開示範 MP3,歌詞與簡譜為示範資料 */

export interface JianpuScore {
  key: string; // 例:"C" → 顯示為 1=C
  timeSignature: string; // 例:"4/4"
  tempo: number;
  /** 單行簡譜(旋律) */
  lines: string[];
  /** 雙行簡譜(鋼琴:上=旋律、下=伴奏),可省略 */
  pianoLines?: [string, string][];
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  /** 封面漸層(無版權圖時的佔位視覺) */
  gradient: string;
  /** 無合法公開音源的曲目省略,播放時由使用者選擇本機音檔 */
  audioUrl?: string;
  /** 內建歌詞;省略時可搭配 lrcQuery 由公開 API 抓取 */
  lrc?: string;
  /** LRCLIB 公開歌詞 API 查詢條件(執行期抓取,不入庫) */
  lrcQuery?: { artist: string; track: string };
  /** 內建簡譜;省略時可在簡譜頁貼上公開簡譜圖片網址 */
  jianpu?: JianpuScore;
  /** 簡譜 JSON 檔路徑(相對於站台根目錄),前端執行期讀取 */
  jianpuUrl?: string;
  /** YouTube 影片 ID:以官方 IFrame Player 嵌入播放(使用者亦可貼連結覆蓋) */
  youtubeId?: string;
  tags: string[];
}

const DEMO_JIANPU: JianpuScore = {
  key: "C",
  timeSignature: "4/4",
  tempo: 88,
  lines: [
    "5 3 3 - | 4 2 2 - | 1 2 3 4 | 5 5 5 - |",
    "5 3 3 - | 4 2 2 - | 1 3 5 5 | 3 - - 0 |",
    "2 2 2 2 | 2 3 4 - | 3 3 3 3 | 3 4 5 - |",
    "5 3 3 - | 4 2 2 - | 1 3 5 5 | 1 - - 0 |"
  ],
  pianoLines: [
    ["5 3 3 - | 4 2 2 - |", "1, 5, 3 5, | 7,, 5, 2 5, |"],
    ["1 2 3 4 | 5 5 5 - |", "1, 5, 3 5, | 1, 5, 3 5, |"],
    ["2 2 2 2 | 2 3 4 - |", "5,, 5, 2 5, | 5,, 5, 2 5, |"],
    ["1 3 5 5 | 1 - - 0 |", "1, 5, 3 5, | 1, 3, 1, 0 |"]
  ]
};

export const SONGS: Song[] = [
  {
    id: "xiaocheng-gushi",
    title: "小城故事",
    artist: "鄧麗君",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    tags: ["熱門", "唱歌", "薩克斯風", "鋼琴"],
    // 歌詞:執行期由 LRCLIB 公開 API 抓取(含同步時間軸)
    lrcQuery: { artist: "鄧麗君", track: "小城故事" },
    // 音源:YouTube 官方授權音軌(Teresa Teng - Topic),以 IFrame Player 嵌入播放
    youtubeId: "n-jHlCu0k2I",
    // 簡譜:JSON 檔存旋律數字,歌詞由 LRCLIB 歌詞逐字對位到音符下方
    jianpuUrl: "scores/xiaocheng-gushi.json",
  },
  {
    id: "helix-1",
    title: "晨光練習曲",
    artist: "SoundHelix Demo",
    gradient: "from-indigo-500 via-purple-500 to-pink-500",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    tags: ["熱門", "唱歌", "薩克斯風"],
    lrc: [
      "[00:00.00]（前奏）",
      "[00:08.00]晨光灑落在窗前",
      "[00:16.00]喚醒沉睡的琴鍵",
      "[00:24.00]每一個音符都是新的起點",
      "[00:32.00]旋律流過指尖",
      "[00:40.00]和聲圍繞在耳邊",
      "[00:48.00]讓音樂帶我們走得更遠",
      "[00:56.00]（間奏）",
      "[01:12.00]風吹過五線譜的邊緣",
      "[01:20.00]節拍踩著時間向前",
      "[01:28.00]唱出心裡最亮的那一面",
      "[01:36.00]（尾奏）"
    ].join("\n"),
    jianpu: DEMO_JIANPU
  },
  {
    id: "helix-2",
    title: "河岸慢板",
    artist: "SoundHelix Demo",
    gradient: "from-sky-500 via-cyan-500 to-emerald-500",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    tags: ["推薦", "鋼琴"],
    lrc: [
      "[00:00.00]（前奏)",
      "[00:10.00]河岸的燈火倒映",
      "[00:20.00]晚風把心事撫平",
      "[00:30.00]慢板的節奏剛好可以呼吸",
      "[00:40.00]往事像水面漣漪",
      "[00:50.00]一圈一圈散去",
      "[01:00.00]留下安靜的旋律"
    ].join("\n"),
    jianpu: { ...DEMO_JIANPU, key: "F", tempo: 66 }
  },
  {
    id: "helix-3",
    title: "夜市圓舞曲",
    artist: "SoundHelix Demo",
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    tags: ["熱門", "薩克斯風"],
    lrc: [
      "[00:00.00](前奏)",
      "[00:07.00]霓虹點亮整條街",
      "[00:14.00]香氣混著人聲鼎沸",
      "[00:21.00]三拍子的腳步輕快又直接",
      "[00:28.00]轉個圈別想太多",
      "[00:35.00]今晚的快樂最重要",
      "[00:42.00]音樂不停就繼續跳"
    ].join("\n"),
    jianpu: { ...DEMO_JIANPU, key: "G", timeSignature: "3/4", tempo: 132 }
  }
];

export const getSong = (id: string | undefined): Song | undefined =>
  SONGS.find((s) => s.id === id);
