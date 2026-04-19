import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        navigate('/dashboard');
      } else {
        setError(data.error || 'Authentication failed.');
      }
    } catch {
      setError('Network error. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background font-body relative">
      {/* SCAN LINE EFFECT */}
      <div className="scan-line opacity-5"></div>
      
      {/* ── LEFT PANEL ── tactical radar visual */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-background flex-col items-center justify-center border-r border-border/20">
        {/* Grid overlay */}
        <div className="absolute inset-0 grid-overlay opacity-20"></div>

        {/* Radar rings */}
        {[160, 260, 360, 460].map((r, i) => (
          <div key={i}
            className="absolute rounded-full border border-primary/20"
            style={{ width: r, height: r, top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              animation: `ping ${4 + i}s cubic-bezier(0,0,0.2,1) infinite`,
              animationDelay: `${i * 0.5}s` }}
          />
        ))}

        {/* Centre radar dot */}
        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="w-20 h-20 rounded-sm border border-primary/40 flex items-center justify-center
            shadow-[0_0_40px_rgba(0,242,255,0.15)] bg-surface/80 backdrop-blur-md">
            <span className="material-symbols-outlined text-primary text-4xl font-light">radar</span>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-sm font-orbitron font-black tracking-[0.4em] text-white uppercase">AEGIS-IV TACTICAL</h2>
            <p className="text-[10px] font-mono text-primary/60 tracking-widest uppercase">
              Operational Intelligence Node
            </p>
          </div>

          {/* Status chips */}
          <div className="flex gap-4 mt-4">
            {['ENCRYPTED', 'LINK_OK', 'SECTOR_7'].map((s) => (
              <span key={s} className="text-[9px] font-mono px-3 py-1.5
                border border-primary/10 bg-primary/5 text-primary/40 tracking-widest uppercase">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── login form */}
      <div className="flex-1 flex items-center justify-center px-6 relative">
        {/* Subtle background grid */}
        <div className="absolute inset-0 grid-overlay opacity-[0.05] lg:hidden"></div>

        {/* Glass card */}
        <div className="relative z-10 w-full max-w-[420px] glass-panel p-10 shadow-2xl space-y-8 border-primary/10">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-sm border border-primary/30 bg-background flex items-center justify-center shadow-[0_0_15px_rgba(0,242,255,0.1)]">
                <span className="material-symbols-outlined text-primary text-xl">login</span>
              </div>
              <div>
                <h1 className="text-lg font-orbitron font-bold uppercase tracking-widest text-white leading-none">
                  Authenticate
                </h1>
                <p className="text-[9px] font-mono text-primary tracking-[0.2em] mt-1.5 font-bold">
                  ACCESS PORTAL ID-72
                </p>
              </div>
            </div>
            <div className="h-[1px] bg-gradient-to-r from-primary/30 via-border/10 to-transparent" />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-accent/10 border-l-2 border-accent px-4 py-3 text-[11px] font-mono text-accent animate-in fade-in slide-in-from-left-2">
              <span className="font-bold mr-2">! ERROR:</span> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-orbitron font-bold text-on-surface-dim tracking-widest uppercase block">
                Operator Identifier
              </label>
              <input
                type="email"
                placeholder="commander@aegis.mil"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full h-12 px-4 bg-background/50 border border-border text-[13px] text-white font-mono placeholder-on-surface-dim/30
                  focus:outline-none focus:border-primary/50 transition-all rounded-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-orbitron font-bold text-on-surface-dim tracking-widest uppercase block">
                Access Protocol Code
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full h-12 px-4 bg-background/50 border border-border text-[13px] text-white font-mono placeholder-on-surface-dim/30
                  focus:outline-none focus:border-primary/50 transition-all rounded-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 btn-tactical-primary flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">security</span>
                  Execute Uplink
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center text-[10px] font-orbitron font-bold tracking-widest text-on-surface-dim pt-4">
            NEW OPERATOR?{' '}
            <Link to="/signup" className="text-primary hover:text-white transition-colors">
              REGISTER SIGNAL
            </Link>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes ping {
          0%   { transform: translate(-50%,-50%) scale(0.8); opacity: 0.2; }
          75%, 100% { transform: translate(-50%,-50%) scale(1.5); opacity: 0; }
        }
      `}} />
    </div>
  );
}
