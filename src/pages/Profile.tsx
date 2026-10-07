import { useState } from 'react';
import { Link } from 'react-router-dom';
import MovieCard from '../components/cards/MovieCard';
import { movies } from '../data/movies';
import { cn } from '../utils/cn';
import { useAuth } from '../hooks/useAuth';

const TABS = ['My List', 'Watch History', 'My Theatres'] as const;
type Tab = (typeof TABS)[number];

export default function Profile() {
  const [activeTab, setActiveTab] = useState<Tab>('My List');
  const { user, profile } = useAuth();

  const myListMovies = movies.slice(0, 4);

  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Auditorium Member';
  const email = user?.email || 'viewer@vcinema.app';

  // Extract initials
  const getInitials = (): string => {
    if (displayName) {
      const parts = displayName.trim().split(/\s+/);
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return displayName.slice(0, 2).toUpperCase();
    }
    return 'VC';
  };

  const memberSinceYear = profile?.createdAt
    ? new Date(typeof profile.createdAt === 'number' ? profile.createdAt : Date.now()).getFullYear()
    : '2026';

  const stats = [
    { label: 'Movies Watched', value: profile?.moviesWatched ?? 24 },
    { label: 'Theatres Hosted', value: profile?.theatresHosted ?? 7 },
    { label: 'Watch Hours', value: `${profile?.watchHours ?? 48}h` },
  ];

  return (
    <div className="min-h-screen pt-[72px]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-12 pb-20">
        {/* Profile header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10">
          {/* Avatar */}
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={displayName}
              className="w-20 h-20 rounded-full object-cover border-2 border-vc-gold/40 flex-shrink-0 shadow-[0_0_24px_rgba(198,167,106,0.2)]"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-serif font-bold text-vc-gold bg-vc-bg-card border border-vc-border-strong flex-shrink-0 shadow-[0_0_20px_rgba(198,167,106,0.15)]"
              aria-label={`${displayName} avatar`}
            >
              {getInitials()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-serif text-3xl text-vc-text-primary font-semibold truncate">
                {displayName}
              </h1>
              <span className="text-[10px] font-mono tracking-widest text-vc-gold bg-vc-gold/10 border border-vc-gold/30 px-2 py-0.5 rounded-[2px] uppercase">
                Active Member
              </span>
            </div>

            <p className="text-xs sm:text-sm text-vc-text-muted mb-4 truncate">
              {email} &middot; Member since {memberSinceYear}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-6">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-xl font-mono font-semibold text-vc-gold">{stat.value}</p>
                  <p className="text-xs text-vc-text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/settings"
            className="flex items-center gap-2 px-4 py-2.5 rounded-[4px] border border-vc-border text-sm text-vc-text-muted hover:border-vc-gold/40 hover:text-vc-gold transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Settings
          </Link>
        </div>

        {/* Sync Status Banner */}
        <div className="flex items-center gap-3 p-4 rounded-[4px] border border-vc-gold/20 bg-vc-gold/5 mb-8">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C6A76A" strokeWidth="2" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <p className="text-xs text-vc-text-muted">
            <span className="text-vc-gold font-medium">Auditorium Profile Active.</span>{' '}
            Your screening history and watchlist are synchronized across your devices.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-vc-border mb-8" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-5 py-3 text-sm font-medium transition-all duration-200 border-b-2 -mb-[1px]',
                activeTab === tab
                  ? 'border-vc-gold text-vc-gold font-semibold'
                  : 'border-transparent text-vc-text-muted hover:text-vc-text-primary',
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div role="tabpanel" aria-label={activeTab}>
          {activeTab === 'My List' && (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {myListMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </div>
          )}
          {activeTab === 'Watch History' && (
            <div className="py-16 text-center glass-panel rounded-[4px] border border-vc-border/60">
              <p className="text-vc-text-muted text-sm">
                Screenings completed in synchronized rooms will appear in your log.
              </p>
            </div>
          )}
          {activeTab === 'My Theatres' && (
            <div className="py-16 text-center glass-panel rounded-[4px] border border-vc-border/60 space-y-4">
              <p className="text-vc-text-muted text-sm">
                No active rooms currently hosted. Ready to open your screen?
              </p>
              <Link
                to="/create-theatre"
                className="inline-flex items-center gap-2 px-6 py-3 bg-vc-gold text-black text-sm font-semibold rounded-[3px] hover:bg-vc-gold/90 transition-all shadow-[0_4px_16px_rgba(198,167,106,0.3)]"
              >
                Configure New Theatre &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
