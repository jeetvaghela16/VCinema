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
    { label: 'Demo Theatre', to: '/theatre/demo' },
  ],
  Account: [
    { label: 'Profile', to: '/profile' },
    { label: 'Settings', to: '/settings' },
    { label: 'My List', to: '/profile' },
  ],
  Company: [
    { label: 'About', to: '/' },
    { label: 'Privacy Policy', to: '/' },
    { label: 'Terms of Service', to: '/' },
    { label: 'Contact', to: '/' },
  ],
};

export default function Footer() {
  return (
    <footer className="w-full bg-vc-bg-elevated border-t border-vc-gold/20" role="contentinfo">
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-6 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-baseline gap-0.5 mb-4" aria-label="VCinema home">
              <span className="font-serif text-3xl font-bold text-vc-gold">V</span>
              <span className="font-sans text-xl font-light text-vc-text-primary tracking-[0.08em]">
                Cinema
              </span>
            </Link>
            <p className="text-vc-text-muted text-sm leading-relaxed max-w-xs mb-6">
              Your cinema. Your people. One screen.
            </p>
            {/* Social placeholder */}
            <div className="flex gap-3">
              {['X', 'IG', 'YT', 'DC'].map((icon) => (
                <button
                  key={icon}
                  className="w-8 h-8 rounded-full border border-vc-border text-[10px] font-semibold text-vc-text-muted hover:border-vc-gold/40 hover:text-vc-gold transition-all flex items-center justify-center"
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
              <h4 className="font-sans text-[11px] font-semibold tracking-widest text-vc-text-muted uppercase mb-4">
                {heading}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-vc-text-muted hover:text-vc-gold transition-colors duration-200"
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
        <div className="pt-6 border-t border-vc-border flex flex-col md:flex-row justify-between items-center gap-3">
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
