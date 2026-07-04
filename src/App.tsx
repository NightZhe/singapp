import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import MiniPlayer from "./components/MiniPlayer";
import OfflineBanner from "./components/OfflineBanner";
import { PlayerProvider } from "./store/PlayerContext";
import Home from "./pages/Home";
import Singing from "./pages/Singing";
import Saxophone from "./pages/Saxophone";
import Piano from "./pages/Piano";
import SongPlayer from "./pages/SongPlayer";

function Shell() {
  const location = useLocation();
  const isSongPage = location.pathname.startsWith("/song/");

  return (
    <div className="mx-auto max-w-lg">
      <OfflineBanner />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/singing" element={<Singing />} />
        <Route path="/saxophone" element={<Saxophone />} />
        <Route path="/piano" element={<Piano />} />
        <Route path="/song/:id" element={<SongPlayer />} />
      </Routes>
      <MiniPlayer />
      {!isSongPage && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <PlayerProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Shell />
      </BrowserRouter>
    </PlayerProvider>
  );
}
