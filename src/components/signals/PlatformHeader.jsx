import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, FileUp, LogOut } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function PlatformHeader({ overlay = false, onUpload }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const ink = overlay ? "text-white hover:text-white/80 drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]" : "text-graphite/50 hover:text-cobalt";
  const brand = overlay ? "text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]" : "text-graphite";
  const kicker = overlay ? "text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]" : "text-graphite/60";

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <header className="relative z-10 flex flex-wrap items-center justify-between gap-4 px-6 md:px-16 py-6">
      <Link to="/" className={`focus:outline-none focus:ring-2 focus:ring-cobalt focus:ring-offset-4 rounded ${overlay ? "focus:ring-offset-[#06101c]" : ""}`}>
        <p className={`font-mono text-xs tracking-[0.3em] uppercase ${kicker}`}>Research paper collections</p>
        <p className={`font-heading text-lg md:text-xl font-semibold tracking-tight ${brand}`}>NCI Digest</p>
      </Link>
      <nav className="flex flex-wrap items-center gap-6">
        <Link
          to="/#community"
          className={`font-mono text-xs tracking-widest uppercase transition-colors flex items-center gap-1 ${ink}`}
        >
          Community collections <ChevronRight className="w-3 h-3" />
        </Link>
        {onUpload ? (
          <button
            type="button"
            onClick={onUpload}
            className={`font-mono text-xs tracking-widest uppercase transition-colors flex items-center gap-1 ${overlay ? "text-white hover:text-white/80 drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]" : "text-cobalt hover:text-cobalt/80"}`}
          >
            <FileUp className="w-3.5 h-3.5" /> Upload a paper
          </button>
        ) : (
          <Link
            to="/?upload=1"
            className={`font-mono text-xs tracking-widest uppercase transition-colors flex items-center gap-1 ${overlay ? "text-white hover:text-white/80 drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]" : "text-cobalt hover:text-cobalt/80"}`}
          >
            <FileUp className="w-3.5 h-3.5" /> Upload a paper
          </Link>
        )}
        {user ? (
          <div className="flex items-center gap-3">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
            ) : (
              <span className="w-7 h-7 rounded-full bg-cobalt/10 text-cobalt font-mono text-xs flex items-center justify-center">
                {user.name.slice(0, 1).toUpperCase()}
              </span>
            )}
            <span className={`font-mono text-xs hidden sm:inline ${overlay ? "text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]" : "text-graphite/60"}`}>{user.name}</span>
            <button
              onClick={handleLogout}
              className={`transition-colors focus:outline-none focus:ring-2 focus:ring-cobalt rounded ${overlay ? "text-white hover:text-white/80" : "text-graphite/40 hover:text-graphite"}`}
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`}
            className="font-mono text-xs tracking-widest uppercase bg-graphite text-white px-4 py-2 rounded-full hover:bg-graphite/90 transition-colors"
          >
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}
