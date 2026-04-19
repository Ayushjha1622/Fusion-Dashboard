import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Wraps any route that requires authentication.
 * Hits /api/data (already protected by authMiddleware on the backend).
 *   • 401 → redirect to /login
 *   • 200 → render children
 */
export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/data`, { credentials: "include" });
        setIsAuth(res.ok); // 200 = authenticated
      } catch {
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#121416]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#00f2ff] border-t-transparent rounded-full animate-spin" />
          <span className="text-[11px] font-mono text-[#00f2ff] tracking-widest uppercase animate-pulse">
            Verifying Clearance...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
