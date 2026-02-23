import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Music2, Home, UserCircle, ListMusic, Menu, X } from 'lucide-react';

const links = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/playlists', label: 'Playlists', icon: ListMusic },
  { to: '/profile', label: 'Profile', icon: UserCircle },
] as const;

export default function Header() {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Skip to main */}
      <a
        href="#main-content"
        className="fixed left-2 top-2 z-[100] -translate-y-16 rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-white/70 shadow-glass backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* ─── Logo ──────────────────────────────────── */}
          <Link to="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-md transition-transform duration-200 group-hover:scale-105">
              <Music2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-surface-900">
              Tune<span className="gradient-text">Loop</span>
            </span>
          </Link>

          {/* ─── Desktop Nav ───────────────────────────── */}
          <nav className="hidden items-center gap-1 sm:flex" aria-label="Main">
            {links.map(({ to, label, icon: Icon }) => {
              const isActive = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`relative flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-primary-600'
                      : 'text-surface-500 hover:bg-surface-100 hover:text-surface-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {/* Active indicator */}
                  {isActive && (
                    <span className="absolute -bottom-[1.13rem] left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-primary-500 to-accent-500" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ─── Mobile burger ─────────────────────────── */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-surface-600 transition-colors hover:bg-surface-100 sm:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* ─── Mobile Nav ────────────────────────────── */}
        {mobileOpen && (
          <nav className="animate-fade-in-down border-t border-surface-100 bg-white/90 backdrop-blur-xl sm:hidden">
            <div className="space-y-1 px-4 py-3">
              {links.map(({ to, label, icon: Icon }) => {
                const isActive = pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-surface-600 hover:bg-surface-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
