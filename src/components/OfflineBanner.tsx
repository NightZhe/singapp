import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

/** 離線狀態提示:搭配 Service Worker 快取,離線時告知僅能使用已快取內容 */
export default function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (online) return null;
  return (
    <div
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2
                 bg-amber-500/95 py-2 text-sm font-medium text-amber-950"
      style={{ paddingTop: "calc(var(--safe-top) + 0.5rem)" }}
    >
      <WifiOff size={16} />
      目前離線中,僅能存取已快取的歌曲與樂譜
    </div>
  );
}
