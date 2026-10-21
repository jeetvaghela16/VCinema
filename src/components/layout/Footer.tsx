import { Link } from 'react-router-dom';

const FOOTER_LINKS = {
  Discover: [
    { label: 'Movies', to: '/movies' },
    { label: 'Web Series', to: '/series' },
    { label: 'New Releases', to: '/movies' },
    { label: 'Top Rated', to: '/movies' },
  ],
  Theatre: [
    { label: 'Create Theatre', to: '/create-theatre' },
    { label: 'Join Theatre', to: '/join-theatre' },
  ],
  Account: [
    { label: 'Profile', to: '/profile' },
    { label: 'Settings', to: '/settings' },
    { label: 'My List', to: '/profile' },
  ],
};

export default function Footer() {
  return (
    <footer className="w-full bg-vc-bg-elevated border-t border-vc-gold/20" role="contentinfo">
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-8 pb-5 sm:pt-9 sm:pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 md:gap-6 mb-6">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-2">
            <Link to="/" className="flex items-baseline gap-0.5 mb-3" aria-label="VCinema home">
              <span className="font-serif text-3xl font-bold text-vc-gold">V</span>
              <span className="font-sans text-xl font-light text-vc-text-primary tracking-[0.08em]">
                Cinema
              </span>
            </Link>
            <p className="text-vc-text-muted text-sm leading-relaxed max-w-xs mb-3.5">
              Your cinema. Your people. One screen.
            </p>
            {/* Social placeholder */}
            <div className="flex gap-3">
              {['X', 'IG', 'YT', 'DC'].map((icon) => (
                <button
                  key={icon}
                  className="w-7 h-7 rounded-full border border-vc-border text-[10px] font-semibold text-vc-text-muted hover:border-vc-gold/40 hover:text-vc-gold transition-all flex items-center justify-center"
                  aria-label={`${icon} social link (placeholder)`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="font-sans text-[11px] font-semibold tracking-widest text-vc-text-muted uppercase mb-3">
                {heading}
              </h4>
              <ul className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-xs text-vc-text-muted hover:text-vc-gold transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-4 border-t border-vc-border/60 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-xs text-vc-text-muted">
            &copy; 2026 VCinema. All rights reserved.
          </p>
          <p className="text-xs text-vc-text-muted opacity-50">
            Authorized content only. Virtual cinema for real audiences.
          </p>
        </div>
      </div>
    </footer>
  );
}
