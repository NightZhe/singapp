import { NavLink } from "react-router-dom";
import { Home, Mic, Wind, Piano } from "lucide-react";

const TABS = [
  { to: "/", label: "首頁", icon: Home },
  { to: "/singing", label: "唱歌", icon: Mic },
  { to: "/saxophone", label: "薩克斯風", icon: Wind },
  { to: "/piano", label: "鋼琴", icon: Piano }
] as const;

export default function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800/80
                 bg-slate-950/85 backdrop-blur-lg"
      style={{ paddingBottom: "var(--safe-bottom)" }}
    >
      <div className="mx-auto flex h-16 max-w-lg items-stretch">
        {TABS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `relative flex flex-1 flex-col items-center justify-center gap-1
               text-[11px] font-medium transition-colors duration-200
               ${isActive ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"}`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`absolute top-0 h-0.5 w-8 rounded-full bg-indigo-400
                              transition-opacity ${isActive ? "opacity-100" : "opacity-0"}`}
                />
                <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
