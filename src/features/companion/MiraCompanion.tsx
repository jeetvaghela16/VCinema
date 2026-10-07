import { useState, type ReactNode } from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { cn } from '../../utils/cn';
import { CinemaSectionDivider } from '../content/ContentSections';

interface ConversationEntry {
  id: string;
  role: 'user' | 'mira';
  text: ReactNode;
  time: string;
}

const PRESET_EXCHANGES: Record<string, ConversationEntry[]> = {
  noir: [
    {
      id: 'u-noir',
      role: 'user',
      text: 'Suggest a slow-burn neo-noir with exceptional cinematography.',
      time: 'Just now',
    },
    {
      id: 'm-noir',
      role: 'mira',
      text: (
        <span>
          A discerning choice. I would direct you to <strong className="font-serif text-vc-gold font-semibold tracking-wide">&ldquo;Neon Requiem&rdquo; (2026)</strong>. Directed with rain-drenched restraint, its monochromatic neon lighting and saxophone-driven score make it an acoustic masterpiece for a midnight screening.
        </span>
      ),
      time: 'Just now',
    },
  ],
  horizon: [
    {
      id: 'u-horizon',
      role: 'user',
      text: 'What makes The Grand Horizon special for a shared screen?',
      time: 'Just now',
    },
    {
      id: 'm-horizon',
      role: 'mira',
      text: (
        <span>
          <strong className="font-serif text-vc-gold font-semibold tracking-wide">&ldquo;The Grand Horizon&rdquo;</strong> was filmed in 65mm anamorphic. The pacing allows viewers in your virtual theatre to linger on landscape frames together without dialogue talking over the quiet emotional crescendo.
        </span>
      ),
      time: 'Just now',
    },
  ],
  duo: [
    {
      id: 'u-duo',
      role: 'user',
      text: 'Recommend something intimate for a Private Screen of two.',
      time: 'Just now',
    },
    {
      id: 'm-duo',
      role: 'mira',
      text: (
        <span>
          For two viewers, <strong className="font-serif text-vc-gold font-semibold tracking-wide">&ldquo;Ember Falls&rdquo; (2025)</strong> is evocative and delicately calibrated. It holds a 7.9 rating and thrives in the focused silence of a 1-on-1 private auditorium.
        </span>
      ),
      time: 'Just now',
    },
  ],
};

const INITIAL_CONVERSATION: ConversationEntry[] = [
  {
    id: '1',
    role: 'user',
    text: 'Suggest an intense mystery for four viewers tonight.',
    time: '21:04',
  },
  {
    id: '2',
    role: 'mira',
    text: (
      <span>
        Good evening. For a party of four, I recommend <strong className="font-serif text-vc-gold font-semibold tracking-wide">&ldquo;The Silent Archive&rdquo; (2024)</strong>. It is a slow-burn investigation involving a sealed century-old library vault. The clues invite active deduction among all four participants as the reels turn.
      </span>
    ),
    time: '21:04',
  },
];

export default function MiraCompanion() {
  const [ref, visible] = useIntersectionObserver();
  const [conversation, setConversation] = useState<ConversationEntry[]>(INITIAL_CONVERSATION);
  const [activeChip, setActiveChip] = useState<string | null>(null);

  const handleSelectChip = (key: 'noir' | 'horizon' | 'duo') => {
    setActiveChip(key);
    const newEntries = PRESET_EXCHANGES[key];
    if (newEntries) {
      setConversation([...INITIAL_CONVERSATION, ...newEntries]);
    }
  };

  return (
    <section
      ref={ref}
      className={cn(
        'max-w-7xl mx-auto px-5 sm:px-8 md:px-10 pb-28 transition-all duration-700',
        visible ? 'animate-slide-up opacity-100' : 'opacity-0 translate-y-6',
      )}
      aria-label="Meet Mira, Chief Cinema Concierge"
    >
      <CinemaSectionDivider
        hallNumber="CURATORIAL DESK"
        title="AI Cinema Concierge"
        subtitle="Intelligent screening curation tailored to audience taste"
      />

      <div className="glass-panel rounded-[6px] border border-vc-border/80 shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden">
        <div className="grid md:grid-cols-12">
          
          {/* ── Left Column: Concierge Crest & Credentials ── */}
          <div className="md:col-span-5 bg-gradient-to-br from-vc-bg-card via-vc-bg-elevated to-vc-bg-base p-7 sm:p-9 md:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-vc-border/70">
            <div>
              {/* Concierge Monogram & Ambient Halo */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  <div className="absolute inset-0 rounded-full bg-vc-gold/15 border border-vc-gold/30 shadow-[0_0_20px_rgba(198,167,106,0.2)]" />
                  <div className="absolute inset-1.5 rounded-full border border-vc-gold/40 flex items-center justify-center">
                    <span className="font-serif text-vc-gold font-bold text-lg select-none">M</span>
                  </div>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-vc-bg-card shadow-sm" />
                </div>

                <div>
                  <h3 className="font-serif text-2xl text-vc-text-primary font-semibold">Mira</h3>
                  <p className="text-[11px] font-mono tracking-widest text-vc-gold uppercase">
                    Cinema Concierge
                  </p>
                </div>
              </div>

              <p className="text-vc-text-muted/95 text-xs sm:text-sm leading-relaxed mb-6">
                Mira acts as your personal cinema maître d&apos;. She assesses the moods of your guests, cross-references screening histories, and curates authorized films suited for your auditorium format.
              </p>

              {/* Curatorial Protocol Attributes */}
              <div className="space-y-2.5 pt-4 border-t border-vc-border/60">
                {[
                  'Bespoke group taste synthesis',
                  'Runtime & pacing curation',
                  'Auditorium acoustic recommendations',
                  'Director retrospectives & trivia',
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-2.5 text-xs text-vc-text-muted">
                    <span className="text-vc-gold text-[10px]" aria-hidden="true">✦</span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Protocol Status Seal */}
            <div className="mt-8 pt-6 border-t border-vc-border/60 flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-widest text-vc-text-muted/70 uppercase">
                Curatorial Protocol
              </span>
              <span className="text-[10px] font-mono text-vc-gold px-2 py-0.5 rounded-[2px] bg-vc-gold/10 border border-vc-gold/30 uppercase">
                Interactive Preview
              </span>
            </div>
          </div>

          {/* ── Right Column: Interactive Curatorial Dialogue Box ── */}
          <div className="md:col-span-7 flex flex-col justify-between bg-black/30">
            
            {/* Salon Header */}
            <div className="px-6 py-4 border-b border-vc-border/60 flex items-center justify-between bg-vc-bg-card/30">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-vc-gold animate-pulse" />
                <span className="text-xs font-mono text-vc-text-primary tracking-wider uppercase">
                  Curatorial Consultation
                </span>
              </div>
              <span className="text-[10px] font-mono text-vc-text-muted">
                Channel: Virtual Salon
              </span>
            </div>

            {/* Conversation Log */}
            <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[340px] scrollbar-thin">
              {conversation.map((msg) => {
                const isMira = msg.role === 'mira';
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex flex-col max-w-[90%] sm:max-w-[85%] animate-fade-in',
                      isMira ? 'self-start' : 'self-end items-end',
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-medium text-vc-text-muted">
                        {isMira ? 'Mira (Concierge)' : 'Guest Host'}
                      </span>
                      <span className="text-[9px] font-mono text-vc-text-muted/50">{msg.time}</span>
                    </div>

                    <div
                      className={cn(
                        'p-4 rounded-[4px] text-xs leading-relaxed',
                        isMira
                          ? 'bg-vc-bg-card/90 text-vc-text-primary border border-vc-gold/25 shadow-[0_4px_16px_rgba(0,0,0,0.4)]'
                          : 'bg-vc-gold/15 text-vc-text-primary border border-vc-gold/35',
                      )}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Curatorial Prompt Chips */}
            <div className="px-6 py-3 border-t border-vc-border/50 bg-vc-bg-elevated/40">
              <p className="text-[10px] font-mono text-vc-text-muted uppercase tracking-wider mb-2">
                Sample Curatorial Requests:
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectChip('noir')}
                  className={cn(
                    'text-[11px] px-3 py-1 rounded-[3px] border transition-all text-left',
                    activeChip === 'noir'
                      ? 'border-vc-gold bg-vc-gold/15 text-vc-gold font-medium'
                      : 'border-vc-border/80 text-vc-text-muted hover:border-vc-gold/40 hover:text-vc-text-primary',
                  )}
                >
                  ✦ Neo-Noir Recommendations
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectChip('horizon')}
                  className={cn(
                    'text-[11px] px-3 py-1 rounded-[3px] border transition-all text-left',
                    activeChip === 'horizon'
                      ? 'border-vc-gold bg-vc-gold/15 text-vc-gold font-medium'
                      : 'border-vc-border/80 text-vc-text-muted hover:border-vc-gold/40 hover:text-vc-text-primary',
                  )}
                >
                  ✦ Why &ldquo;The Grand Horizon&rdquo;?
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectChip('duo')}
                  className={cn(
                    'text-[11px] px-3 py-1 rounded-[3px] border transition-all text-left',
                    activeChip === 'duo'
                      ? 'border-vc-gold bg-vc-gold/15 text-vc-gold font-medium'
                      : 'border-vc-border/80 text-vc-text-muted hover:border-vc-gold/40 hover:text-vc-text-primary',
                  )}
                >
                  ✦ For a Private Screen of Two
                </button>
              </div>
            </div>

            {/* Input Placard (Visual Only) */}
            <div className="p-6 pt-3">
              <div
                className="flex items-center justify-between px-4 py-3 rounded-[4px] border border-vc-border bg-vc-bg-base/60 text-vc-text-muted/60 cursor-not-allowed select-none"
                role="presentation"
              >
                <span className="text-xs">Inquire with Concierge Desk...</span>
                <span className="text-[10px] font-mono tracking-wider text-vc-gold/80 bg-vc-gold/10 px-2 py-0.5 rounded-[2px] border border-vc-gold/20 uppercase">
                  Full Dialogue In Step 2
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
