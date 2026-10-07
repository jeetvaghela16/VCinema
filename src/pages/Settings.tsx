import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';
import { useAuth } from '../hooks/useAuth';
import { updateUserProfile } from '../services/userService';

type Section = 'Account' | 'Appearance' | 'Playback' | 'Notifications';
const SECTIONS: Section[] = ['Account', 'Appearance', 'Playback', 'Notifications'];

function Toggle({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-vc-border last:border-0">
      <div>
        <label htmlFor={id} className="text-sm font-medium text-vc-text-primary cursor-pointer">
          {label}
        </label>
        {description && <p className="text-xs text-vc-text-muted mt-0.5">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0',
          checked ? 'bg-vc-gold' : 'bg-vc-bg-card border border-vc-border',
        )}
        aria-label={label}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200',
            checked ? 'translate-x-5' : 'translate-x-0',
          )}
        />
      </button>
    </div>
  );
}

export default function Settings() {
  const [activeSection, setActiveSection] = useState<Section>('Account');
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  // Account editing state
  const [displayNameInput, setDisplayNameInput] = useState(
    profile?.displayName || user?.displayName || ''
  );
  const [isSavingName, setIsSavingName] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Appearance
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Playback
  const [quality, setQuality] = useState('auto');
  const [autoplay, setAutoplay] = useState(true);

  // Notifications
  const [notifTheatre, setNotifTheatre] = useState(true);
  const [notifNewRelease, setNotifNewRelease] = useState(false);
  const [notifFriends, setNotifFriends] = useState(true);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !displayNameInput.trim()) return;

    setIsSavingName(true);
    setSaveSuccess(false);
    try {
      await updateUserProfile(user.uid, { displayName: displayNameInput.trim() });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Update name error:', err);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const getInitials = (): string => {
    const name = displayNameInput || user?.displayName || user?.email || 'VC';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen pt-[72px]">
      <div className="max-w-4xl mx-auto px-6 md:px-10 pt-12 pb-20">
        <div className="section-divider mb-0">
          <h1 className="font-sans text-[11px] font-semibold tracking-[0.25em] text-vc-gold uppercase">
            Auditorium Console
          </h1>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl text-vc-text-primary mt-4 mb-10 font-semibold">
          Account & Preferences
        </h2>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <nav
            className="md:w-48 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0"
            aria-label="Settings sections"
          >
            {SECTIONS.map((section) => (
              <button
                key={section}
                type="button"
                onClick={() => setActiveSection(section)}
                className={cn(
                  'px-4 py-2.5 rounded-[4px] text-sm font-medium text-left whitespace-nowrap transition-all duration-200',
                  activeSection === section
                    ? 'bg-vc-bg-card text-vc-gold border-l-2 border-vc-gold font-semibold'
                    : 'text-vc-text-muted hover:text-vc-text-primary hover:bg-vc-bg-card/50',
                )}
                aria-current={activeSection === section ? 'page' : undefined}
              >
                {section}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="flex-1 glass-panel rounded-[6px] p-6 md:p-8 border border-vc-border/80 shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
            {/* ── SECTION: Account ── */}
            {activeSection === 'Account' && (
              <div className="space-y-8">
                <div>
                  <h3 className="font-serif text-xl text-vc-text-primary font-semibold mb-1">
                    Auditorium Account
                  </h3>
                  <p className="text-xs text-vc-text-muted">
                    Manage your identity, cinema credentials, and active session.
                  </p>
                </div>

                {/* Identity Card */}
                <div className="flex items-center gap-4 p-4 rounded-[4px] bg-vc-bg-base/60 border border-vc-border">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="User avatar"
                      className="w-14 h-14 rounded-full object-cover border border-vc-gold/40"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-vc-gold/15 border border-vc-gold/30 flex items-center justify-center font-serif text-lg font-bold text-vc-gold">
                      {getInitials()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-vc-text-primary truncate">
                      {profile?.displayName || user?.displayName || 'Authorized Member'}
                    </p>
                    <p className="text-xs text-vc-text-muted font-mono truncate">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono text-vc-gold uppercase px-1.5 py-0.5 rounded-[2px] bg-vc-gold/10 border border-vc-gold/20">
                        UID: {user?.uid.slice(0, 8)}...
                      </span>
                      <span className="text-[10px] text-emerald-400">● Session Active</span>
                    </div>
                  </div>
                </div>

                {/* Update Display Name Form */}
                <form onSubmit={handleUpdateName} className="space-y-4 pt-2 border-t border-vc-border/60">
                  <div>
                    <label
                      htmlFor="display-name"
                      className="block text-xs font-semibold text-vc-text-muted uppercase tracking-widest mb-2"
                    >
                      Screen Display Name
                    </label>
                    <div className="flex gap-3">
                      <input
                        id="display-name"
                        type="text"
                        value={displayNameInput}
                        onChange={(e) => setDisplayNameInput(e.target.value)}
                        placeholder="e.g. CinemaLover"
                        className="flex-1 bg-vc-bg-base border border-vc-border rounded-[4px] px-4 py-2.5 text-sm text-vc-text-primary focus:border-vc-gold/60 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={isSavingName}
                        className="px-5 py-2.5 bg-vc-gold text-black text-xs font-mono tracking-wider font-semibold rounded-[4px] hover:bg-vc-gold/90 transition-all uppercase disabled:opacity-50"
                      >
                        {isSavingName ? 'Saving...' : 'Save Name'}
                      </button>
                    </div>
                    {saveSuccess && (
                      <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1 animate-fade-in">
                        <span>✓</span> <span>Display name updated in profile.</span>
                      </p>
                    )}
                  </div>
                </form>

                {/* Account Details */}
                <div className="space-y-3 pt-4 border-t border-vc-border/60 text-xs">
                  <div className="flex items-center justify-between py-2 border-b border-vc-border/40">
                    <span className="text-vc-text-muted">Email Authentication</span>
                    <span className="font-mono text-vc-text-primary">{user?.email}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-vc-border/40">
                    <span className="text-vc-text-muted">Account Security</span>
                    <span className="text-vc-gold font-mono">Firebase Protected</span>
                  </div>
                </div>

                {/* Sign Out Action */}
                <div className="pt-4 border-t border-vc-border/60">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="px-6 py-3 rounded-[4px] border border-vc-burgundy/60 text-vc-burgundy hover:bg-vc-burgundy/15 hover:border-vc-burgundy text-xs font-mono uppercase tracking-wider font-semibold transition-all flex items-center gap-2"
                  >
                    <span>Sign Out of VCinema</span>
                  </button>
                </div>
              </div>
            )}

            {/* ── SECTION: Appearance ── */}
            {activeSection === 'Appearance' && (
              <div>
                <h3 className="font-serif text-xl text-vc-text-primary mb-6">Appearance</h3>
                <div className="mb-6">
                  <p className="text-xs font-semibold text-vc-text-muted uppercase tracking-widest mb-3">
                    Theme
                  </p>
                  <div className="flex gap-3">
                    {(['dark', 'light'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTheme(t)}
                        className={cn(
                          'px-6 py-2.5 rounded-[4px] text-sm font-medium capitalize border transition-all',
                          theme === t
                            ? 'border-vc-gold bg-vc-gold/10 text-vc-gold font-semibold'
                            : 'border-vc-border text-vc-text-muted hover:border-vc-border-strong',
                        )}
                        aria-pressed={theme === t}
                      >
                        {t === 'dark' ? '🌑 Dark (Cinema Standard)' : '☀️ Light'}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-vc-text-muted mt-2">
                    VCinema is engineered for low-light digital auditorium viewing.
                  </p>
                </div>
              </div>
            )}

            {/* ── SECTION: Playback ── */}
            {activeSection === 'Playback' && (
              <div>
                <h3 className="font-serif text-xl text-vc-text-primary mb-6">Playback</h3>
                <div className="mb-6">
                  <label htmlFor="quality" className="block text-xs font-semibold text-vc-text-muted uppercase tracking-widest mb-2">
                    Default Video Quality
                  </label>
                  <select
                    id="quality"
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full bg-vc-bg-base border border-vc-border rounded-[4px] px-4 py-3 text-sm text-vc-text-primary focus:border-vc-gold/50 focus:outline-none"
                  >
                    <option value="auto">Auto (4K HDR Adaptive)</option>
                    <option value="4k">4K UHD Master</option>
                    <option value="1080">1080p HD</option>
                    <option value="720">720p</option>
                  </select>
                </div>
                <Toggle
                  id="autoplay"
                  label="Autoplay Next Episode"
                  description="Automatically play the next episode in a web series."
                  checked={autoplay}
                  onChange={setAutoplay}
                />
              </div>
            )}

            {/* ── SECTION: Notifications ── */}
            {activeSection === 'Notifications' && (
              <div>
                <h3 className="font-serif text-xl text-vc-text-primary mb-6">Notifications</h3>
                <Toggle
                  id="notif-theatre"
                  label="Auditorium Invitations"
                  description="Notify when a host invites your account to a screening."
                  checked={notifTheatre}
                  onChange={setNotifTheatre}
                />
                <Toggle
                  id="notif-release"
                  label="New Theatrical Releases"
                  description="Notify when a title on your watchlist is premiered."
                  checked={notifNewRelease}
                  onChange={setNotifNewRelease}
                />
                <Toggle
                  id="notif-friends"
                  label="Friends Screening Activity"
                  description="Notify when friends enter an open auditorium."
                  checked={notifFriends}
                  onChange={setNotifFriends}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
