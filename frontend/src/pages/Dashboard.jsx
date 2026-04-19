import React, { useState } from "react";
import App from "../App.jsx";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("map");

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div className="flex h-screen bg-background text-on-surface font-body overflow-hidden">
      {/* SCAN LINE EFFECT */}
      <div className="scan-line opacity-10"></div>
      
      {/* TACTICAL SIDEBAR */}
      <aside className="w-80 h-full glass-panel flex flex-col z-50 shadow-2xl relative">
        {/* LOGO AREA */}
        <div className="p-8 border-b border-border border-opacity-30">
          <div className="flex items-center gap-4 group cursor-default">
            <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-sm flex items-center justify-center border border-primary border-opacity-40 group-hover:bg-primary group-hover:bg-opacity-20 transition-all duration-500 shadow-[0_0_20px_rgba(0,242,255,0.1)] group-hover:shadow-[0_0_30px_rgba(0,242,255,0.3)]">
              <span className="material-symbols-outlined text-primary text-2xl font-light">radar</span>
            </div>
            <div>
              <h1 className="text-xl font-black font-orbitron tracking-tight text-white leading-none uppercase">AEGIS-IV</h1>
              <p className="text-[9px] text-primary text-opacity-60 font-mono tracking-[0.3em] mt-1.5 font-bold">TACTICAL OSINT CORE</p>
            </div>
          </div>
        </div>

        {/* NAVIGATION / TABS */}
        <nav className="p-6 space-y-2 flex-1">
          <button 
            onClick={() => setActiveTab("map")}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-none transition-all duration-300 group ${activeTab === 'map' ? 'bg-primary bg-opacity-10 border-l-2 border-primary text-primary' : 'text-on-surface-dim hover:text-white hover:bg-white hover:bg-opacity-5'}`}
          >
            <span className={`material-symbols-outlined text-xl ${activeTab === 'map' ? 'neon-text-cyan' : ''}`}>grid_view</span>
            <span className="font-orbitron text-[10px] font-bold tracking-widest uppercase">Tactical Map</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("matrix")}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-none transition-all duration-300 group ${activeTab === 'matrix' ? 'bg-primary bg-opacity-10 border-l-2 border-primary text-primary' : 'text-on-surface-dim hover:text-white hover:bg-white hover:bg-opacity-5'}`}
          >
            <span className="material-symbols-outlined text-xl">database</span>
            <span className="font-orbitron text-[10px] font-bold tracking-widest uppercase">Data Matrix</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("sat")}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-none transition-all duration-300 group ${activeTab === 'sat' ? 'bg-primary bg-opacity-10 border-l-2 border-primary text-primary' : 'text-on-surface-dim hover:text-white hover:bg-white hover:bg-opacity-5'}`}
          >
            <span className={`material-symbols-outlined text-xl ${activeTab === 'sat' ? 'neon-text-cyan' : ''}`}>satellite_alt</span>
            <span className="font-orbitron text-[10px] font-bold tracking-widest uppercase">Sat-Link</span>
          </button>
        </nav>

        {/* SIDEBAR FOOTER / COMMANDER INFO */}
        <div className="mt-auto p-6 bg-surface bg-opacity-40 border-t border-border border-opacity-30">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-surface-light border border-border flex items-center justify-center overflow-hidden">
              <span className="material-symbols-outlined text-on-surface-dim">person</span>
            </div>
            <div className="flex-1">
              <div className="text-[11px] font-bold text-white uppercase tracking-wider">Commander</div>
              <div className="text-[9px] text-primary text-opacity-60 font-mono">CLEARANCE: OMEGA</div>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 border border-accent border-opacity-30 text-accent text-opacity-80 hover:bg-accent hover:text-white hover:border-accent transition-all duration-300 font-orbitron text-[9px] font-bold tracking-[0.2em] uppercase"
          >
            <span className="material-symbols-outlined text-sm">power_settings_new</span>
            Terminate Session
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* HEADER / HUD BAR */}
        <header className="h-16 glass-panel border-b border-border border-opacity-30 flex items-center justify-between px-10 z-40">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_10px_rgba(255,186,53,0.5)]"></span>
              <span className="text-[10px] font-mono text-secondary font-bold tracking-widest">DEFCON: ELEVATED</span>
            </div>
            <div className="h-4 w-[1px] bg-border/40"></div>
            <div className="text-[10px] font-mono text-on-surface-dim flex gap-4 uppercase">
              <span>Sector: <span className="text-white">7-ALPHA</span></span>
              <span>Grid: <span className="text-white">XV-902</span></span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="text-right">
                <div className="text-[9px] font-mono text-on-surface-dim">SYSTEM UPTIME</div>
                <div className="text-[11px] font-mono text-primary">04:12:44:09</div>
             </div>
             <div className="h-8 w-[1px] bg-border/40"></div>
             <div className="flex gap-4 text-on-surface-dim">
                <span className="material-symbols-outlined hover:text-primary cursor-pointer transition-colors">notifications</span>
                <span className="material-symbols-outlined hover:text-primary cursor-pointer transition-colors">settings</span>
             </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 relative">
          <App mapMode={activeTab} />
        </div>
      </main>
    </div>
  );
}
