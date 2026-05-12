import { Link, useNavigate } from 'react-router-dom';
import { BrainCircuit, FileText, LayoutDashboard, LogOut, Sparkles } from 'lucide-react';
import { clearAuth, getToken, getUser } from '../services/auth';

export default function Layout({ children, showNav = true }) {
  const navigate = useNavigate();
  const user = getUser();
  const token = getToken();

  const logout = () => {
    clearAuth();
    navigate('/');
  };

  return (
    <div className="app-shell">
      {showNav && (
        <header className="sticky top-0 z-40 border-b border-white/70 bg-white/70 backdrop-blur-2xl">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex min-h-16 items-center justify-between py-3">
              <button onClick={() => navigate('/')} className="flex items-center gap-3 text-left">
                <div className="pulse-soft flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-indigo-500/20">
                  <BrainCircuit size={22} />
                </div>
                <div className="leading-tight">
                  <div className="text-lg font-extrabold text-gray-900">
                    PlacementPrep <span className="text-indigo-600">AI</span>
                  </div>
                  <div className="text-xs font-medium text-gray-500">Interview studio and resume intelligence</div>
                </div>
              </button>

              <nav className="hidden items-center gap-2 sm:flex">
                {token ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-900 hover:text-white"
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>
                    <Link
                      to="/resume"
                      className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-900 hover:text-white"
                    >
                      <FileText size={16} />
                      Resume
                    </Link>
                    <button
                      onClick={logout}
                      className="ml-2 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                    <div className="ml-2 rounded-full border border-gray-200 bg-white/70 px-4 py-2 text-sm text-gray-600 shadow-sm">
                      Hi, <span className="font-bold text-gray-900">{user?.name || 'there'}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="rounded-full px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="shine-button rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <Sparkles size={16} />
                        Sign up
                      </span>
                    </Link>
                  </>
                )}
              </nav>

              <div className="sm:hidden">
                {token ? (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition"
                  >
                    Dashboard
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      <main>{children}</main>

      <footer className="border-t border-white/70 bg-white/60 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 py-6 text-sm text-gray-500 sm:flex-row sm:items-center sm:px-6">
          <div>
            Copyright © 2026 Lovjyot Singh | <span className="font-semibold text-gray-700">PlacementPrep AI</span>
          </div>
          <div className="text-xs">Practice smarter. Walk in sharper.</div>
        </div>
      </footer>
    </div>
  );
}
