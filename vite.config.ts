import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// GitHub Pages 部署在 /<repo>/ 子路徑,由 BASE_PATH 環境變數控制
const base = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        name: "SingApp 樂譜隨行",
        short_name: "SingApp",
        description: "唱歌、薩克斯風、鋼琴的簡譜與動態歌詞 PWA",
        lang: "zh-Hant",
        display: "standalone",
        orientation: "portrait",
        start_url: base,
        scope: base,
        theme_color: "#0f172a",
        background_color: "#0f172a",
        // 相對路徑:以 manifest 所在位置解析,子路徑部署也正確
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,woff2,json}"],
        navigateFallback: `${base}index.html`,
        runtimeCaching: [
          {
            // 公開音檔:離線優先,支援 Range request(拖曳進度條)
            urlPattern: ({ request, url }) =>
              request.destination === "audio" || /\.(mp3|m4a|ogg)$/i.test(url.pathname),
            handler: "CacheFirst",
            options: {
              cacheName: "audio-cache",
              rangeRequests: true,
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          },
          {
            // 歌詞 (LRC) 與簡譜資料:先取新版,失敗時用快取
            urlPattern: ({ url }) => /\.(lrc|json)$/i.test(url.pathname),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "score-cache",
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          },
          {
            // 簡譜圖片
            urlPattern: ({ request }) => request.destination === "image",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "image-cache",
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 14 }
            }
          }
        ]
      }
    })
  ]
});
