import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';

const NAV_LINKS = [
  { label: 'Discover', to: '/' },
  { label: 'Movies', to: '/movies' },
  { label: 'Series', to: '/series' },
  { label: 'Theatre', to: '/create-theatre' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { user, profile, isAuthenticated, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  // Initials generator
  const getInitials = (): string => {
    if (user?.displayName) {
      const parts = user.displayName.trim().split(/\s+/);
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return user.displayName.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'GU';
  };

  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Guest';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  // Close menus on route change
  useEffect(() => {
    setDrawerOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Close user menu on outside click or Escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
        setDrawerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setUserMenuOpen(false);
      navigate('/');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 sm:px-8 md:px-10',
          'h-[72px] transition-all duration-300 ease-out',
          scrolled
            ? 'bg-vc-bg-base/90 backdrop-blur-md border-b border-vc-border/80 shadow-[0_8px_30px_rgba(0,0,0,0.8)]'
            : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent border-b border-transparent',
        )}
        role="banner"
      >
        {/* VCinema Original Wordmark */}
        <Link
          to="/"
          className="flex items-baseline gap-1 group select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-vc-gold rounded-[2px]"
          aria-label="VCinema — Return to Home"
        >
          <span className="font-serif text-2xl sm:text-3xl font-bold text-vc-gold leading-none group-hover:scale-105 transition-transform duration-200">
            V
          </span>
          <span className="font-sans text-lg sm:text-xl font-light text-vc-text-primary tracking-[0.1em] group-hover:text-vc-gold transition-colors duration-200">
            Cinema
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-vc-gold/80 ml-0.5 opacity-80" aria-hidden="true" />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main Navigation">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                cn(
                  'relative py-2 text-xs sm:text-sm font-medium tracking-wide transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-vc-gold rounded-[2px]',
                  isActive
                    ? 'text-vc-gold font-semibold'
                    : 'text-vc-text-muted hover:text-vc-text-primary',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span>{link.label}</span>
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-vc-gold rounded-full shadow-[0_0_8px_#c6a76a]"
                      aria-hidden="true"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/join-theatre"
            className="text-xs font-mono tracking-wider text-vc-text-muted hover:text-vc-gold px-3 py-1.5 rounded-[3px] border border-vc-border/80 hover:border-vc-gold/40 transition-all uppercase"
          >
            Enter Code
          </Link>

          {/* User Account / Sign In State */}
          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-vc-bg-card/70 border border-vc-border hover:border-vc-gold/50 transition-all group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-vc-gold"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                aria-label="User Account Menu"
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={displayName}
                    className="w-7 h-7 rounded-full object-cover border border-vc-gold/40"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-vc-gold/15 border border-vc-gold/30 flex items-center justify-center text-[10px] font-bold text-vc-gold group-hover:scale-105 transition-transform">
                    {getInitials()}
                  </div>
                )}
                <span className="text-xs font-medium text-vc-text-primary max-w-[100px] truncate">
                  {displayName}
                </span>
                <span className="text-[10px] text-vc-text-muted group-hover:text-vc-gold transition-colors">
                  ▾
                </span>
              </button>

              {/* Account Dropdown Menu */}
              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 glass-panel rounded-[4px] border border-vc-border-strong shadow-[0_16px_40px_rgba(0,0,0,0.8)] py-2 z-50 animate-slide-down"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="px-4 py-2 border-b border-vc-border/60">
                    <p className="text-xs font-semibold text-vc-text-primary truncate">
                      {displayName}
                    </p>
                    <p className="text-[10px] text-vc-text-muted truncate">
                      {user?.email}
                    </p>
                  </div>

                  <Link
                    to="/profile"
                    role="menuitem"
                    className="block px-4 py-2 text-xs text-vc-text-muted hover:text-vc-gold hover:bg-white/[0.04] transition-colors"
                  >
                    Auditorium Profile
                  </Link>

                  <Link
                    to="/settings"
                    role="menuitem"
                    className="block px-4 py-2 text-xs text-vc-text-muted hover:text-vc-gold hover:bg-white/[0.04] transition-colors"
                  >
                    Account Settings
                  </Link>

                  <div className="border-t border-vc-border/60 my-1" />

                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-xs text-vc-burgundy hover:text-red-400 hover:bg-white/[0.04] transition-colors flex items-center gap-1.5"
                  >
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 p-1.5 px-3.5 rounded-full bg-vc-bg-card/70 border border-vc-border hover:border-vc-gold/40 transition-all text-xs font-medium text-vc-text-muted hover:text-vc-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-vc-gold"
            >
              <div className="w-5 h-5 rounded-full bg-white/5 border border-vc-border flex items-center justify-center text-[9px] text-vc-gold">
                GU
              </div>
              <span>Sign In</span>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="md:hidden flex flex-col justify-center items-center gap-1.5 w-10 h-10 rounded-[3px] border border-vc-border/70 bg-vc-bg-card/50 text-vc-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-vc-gold"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={drawerOpen}
          aria-controls="mobile-drawer"
        >
          <span className="w-5 h-[1.5px] bg-vc-text-primary block transition-transform" />
          <span className="w-5 h-[1.5px] bg-vc-gold block transition-transform" />
          <span className="w-3.5 h-[1.5px] bg-vc-text-primary block self-start ml-2.5 transition-transform" />
        </button>
      </header>

      {/* Mobile Drawer Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-[85vw] max-w-[340px]',
          'bg-vc-bg-elevated border-l border-vc-border md:hidden',
          'flex flex-col justify-between transition-transform duration-300 ease-out shadow-2xl',
          drawerOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div>
          <div className="flex items-center justify-between px-6 pt-6 pb-6 border-b border-vc-border/70">
            <Link
              to="/"
              className="flex items-baseline gap-1"
              onClick={() => setDrawerOpen(false)}
            >
              <span className="font-serif text-2xl font-bold text-vc-gold">V</span>
              <span className="font-sans text-base font-light text-vc-text-primary tracking-[0.1em]">
                Cinema
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="w-9 h-9 rounded-[3px] border border-vc-border flex items-center justify-center text-vc-text-muted hover:text-vc-text-primary transition-colors"
              aria-label="Close menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="p-4 space-y-1.5" aria-label="Mobile Navigation Links">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setDrawerOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between px-4 py-3.5 rounded-[4px] text-sm font-medium transition-all',
                    isActive
                      ? 'bg-vc-gold/15 text-vc-gold border-l-2 border-vc-gold'
                      : 'text-vc-text-muted hover:text-vc-text-primary hover:bg-white/[0.04]',
                  )
                }
              >
                <span>{link.label}</span>
                <span className="text-xs text-vc-gold opacity-60">&rarr;</span>
              </NavLink>
            ))}

            <div className="pt-2 border-t border-vc-border/50">
              <NavLink
                to="/join-theatre"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-[4px] text-xs font-mono tracking-wider uppercase text-vc-gold bg-vc-gold/5 border border-vc-gold/20"
              >
                <span>Enter Room Code</span>
                <span>VCX-</span>
              </NavLink>
            </div>
          </nav>
        </div>

        {/* Drawer Footer with Account Information */}
        <div className="p-5 border-t border-vc-border/70 bg-vc-bg-base/60">
          {isAuthenticated ? (
            <div className="space-y-3">
              <Link
                to="/profile"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 p-3 rounded-[4px] bg-vc-bg-card border border-vc-border hover:border-vc-gold/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-vc-gold/15 border border-vc-gold/30 flex items-center justify-center text-xs font-bold text-vc-gold">
                  {getInitials()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-vc-text-primary truncate">{displayName}</p>
                  <p className="text-[10px] text-vc-text-muted truncate">{user?.email}</p>
                </div>
              </Link>

              <div className="flex gap-2">
                <Link
                  to="/settings"
                  onClick={() => setDrawerOpen(false)}
                  className="flex-1 text-center py-2 rounded-[3px] border border-vc-border text-xs text-vc-text-muted hover:text-vc-gold transition-colors"
                >
                  Settings
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    handleSignOut();
                    setDrawerOpen(false);
                  }}
                  className="flex-1 text-center py-2 rounded-[3px] border border-vc-burgundy/40 text-xs text-vc-burgundy hover:text-red-400 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center justify-between p-3.5 rounded-[4px] bg-vc-gold/10 border border-vc-gold/30 hover:bg-vc-gold/15 transition-colors text-xs font-medium text-vc-gold"
            >
              <span>Sign In / Create Account</span>
              <span>&rarr;</span>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
