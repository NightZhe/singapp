# SingApp 樂譜隨行

行動端優先的 PWA 音樂應用:動態歌詞(LRC)+ 簡譜(首調記譜)顯示,支援離線快取與安裝到主畫面。

## 技術堆疊
Vite 6 · React 18 · TypeScript · Tailwind CSS v4 · vite-plugin-pwa (Workbox) · lucide-react · react-router-dom

## 指令
```bash
npm install       # 安裝依賴
npm run dev       # 開發伺服器(SW 預設只在 build 後生效)
npm run build     # 型別檢查 + 打包 + 產生 Service Worker
npm run preview   # 本機預覽正式版(測試 PWA 離線/安裝)
npm run icons     # 重新產生 PWA 佔位圖示
```

## 四個 Tab
| Tab | 路徑 | 重點 |
|-----|------|------|
| 🏠 首頁 | `/` | 輪播圖、熱門歌曲、樂器分類入口 |
| 🎤 唱歌 | `/singing` | 滿版動態歌詞、人聲/伴奏切換 |
| 🎷 薩克斯風 | `/saxophone` | 單行簡譜、C/Bb/Eb 移調 |
| 🎹 鋼琴 | `/piano` | 雙行簡譜、一鍵橫向全螢幕 |

單曲播放頁:`/song/:id`(播放器 + 歌詞/簡譜切換)。

## 資料來源
示範音檔使用 SoundHelix 公開 MP3;歌詞與簡譜為內建示範資料([src/data/songs.ts](src/data/songs.ts))。
要串接真實公開來源,將 [src/lib/api.ts](src/lib/api.ts) 的 `fetchSongIndex / fetchLrc / fetchJianpu` 指向實際 URL 即可,
音檔與樂譜的離線快取策略已在 [vite.config.ts](vite.config.ts) 的 `runtimeCaching` 中設定。

> 注意:僅串接有明確授權的公開資源(公版音樂、CC 授權、官方 API),避免抓取受版權保護的內容。
