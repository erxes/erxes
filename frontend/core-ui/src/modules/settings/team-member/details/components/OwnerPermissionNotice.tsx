import { useTranslation } from 'react-i18next';

// Scoped to this drawing: the bubbles rise, the cheek puffs, the bot sways.
const DON_STYLES = `
@keyframes don-up {
  0% { transform: translate(0, 0) scale(0.3); opacity: 0; }
  12% { opacity: 0.95; }
  80% { opacity: 0.85; }
  100% { transform: translate(var(--don-dx), -70px) scale(1); opacity: 0; }
}
@keyframes don-puff { 0%, 100% { transform: scale(1); } 40% { transform: scale(1.08); } }
@keyframes don-sway { 0%, 100% { transform: rotate(0); } 50% { transform: rotate(-2deg); } }
@keyframes don-glow { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
.don-bubble { transform-box: fill-box; transform-origin: center; animation: don-up 3.6s ease-out infinite; }
.don-b1 { --don-dx: 6px; }
.don-b2 { --don-dx: -14px; animation-delay: 0.9s; }
.don-b3 { --don-dx: 10px; animation-delay: 1.8s; }
.don-b4 { --don-dx: -4px; animation-delay: 2.7s; }
.don-cheek { transform-box: fill-box; transform-origin: center; animation: don-puff 3.6s ease-in-out infinite; }
.don-bot { transform-origin: 110px 150px; animation: don-sway 5s ease-in-out infinite; }
.don-eye { animation: don-glow 3s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .don-bubble, .don-cheek, .don-bot, .don-eye { animation: none; }
  .don-bubble { opacity: 0.6; }
}
`;

const WHITE = '#FFFFFF';
const OUTLINE = '#E4E2F3';
const VIOLET = '#6E56CF';
const GLOW = '#A78BFA';
const LEATHER = '#6B2B2B';
const LEATHER_LIGHT = '#7E3434';

// The erxes bot as the don: fedora, suit, leather chair, a bubble pipe.
const ErxesBotDon = () => (
  <svg viewBox="0 0 220 210" className="w-72 shrink-0" aria-hidden="true">
    <style>{DON_STYLES}</style>
    <ellipse cx="110" cy="196" rx="74" ry="7" className="fill-muted" />
    <path d="M50 70Q50 40 80 40H140Q170 40 170 70V160H50Z" fill={LEATHER} />
    <path
      d="M62 74Q62 52 84 52H136Q158 52 158 74V150H62Z"
      fill={LEATHER_LIGHT}
    />
    <g fill="#5A2222">
      <circle cx="84" cy="70" r="2.2" />
      <circle cx="110" cy="66" r="2.2" />
      <circle cx="136" cy="70" r="2.2" />
      <circle cx="84" cy="100" r="2.2" />
      <circle cx="110" cy="96" r="2.2" />
      <circle cx="136" cy="100" r="2.2" />
      <circle cx="84" cy="128" r="2.2" />
      <circle cx="136" cy="128" r="2.2" />
    </g>
    <g className="don-bot">
      <rect x="78" y="128" width="64" height="44" rx="20" fill="#2B2B33" />
      <path d="M98 129L110 150L122 129Z" fill="#F4F4F4" />
      <path d="M108 131H112L113.5 145L110 150L106.5 145Z" fill="#C0262D" />
      <circle cx="130" cy="140" r="3.2" fill="#E5484D" />
      <circle
        cx="110"
        cy="96"
        r="38"
        fill={WHITE}
        stroke={OUTLINE}
        strokeWidth="2"
      />
      <rect x="82" y="80" width="56" height="34" rx="17" fill="#2A1F5C" />
      <rect
        className="don-eye"
        x="89"
        y="91"
        width="16"
        height="7"
        rx="3.5"
        fill={GLOW}
      />
      <rect
        className="don-eye"
        x="115"
        y="91"
        width="16"
        height="7"
        rx="3.5"
        fill={GLOW}
      />
      <ellipse
        className="don-cheek"
        cx="128"
        cy="106"
        rx="4"
        ry="3"
        fill={GLOW}
        opacity="0.45"
      />
      <ellipse cx="110" cy="64" rx="46" ry="7" fill="#22222A" />
      <path d="M83 64Q84 37 110 39Q136 37 137 64Z" fill="#2F2F38" />
      <path
        d="M98 41Q110 48 122 41"
        stroke="#22222A"
        strokeWidth="2"
        fill="none"
      />
      <rect x="83.5" y="55" width="53" height="7" fill={VIOLET} />
      <path
        d="M114.4 58.5c1.6-2.4 3.2-5 4.6-7.6-1.6 1.8-3.4 4.3-5.1 6.8-.9-1.3-2-2.6-3.2-4 1.2 2.2 1.8 3.4 2.7 4.7-2.6 3.8-4.6 7.3-4.6 7.3 1.7-2 3.5-4.2 5.1-6.6.7 1 1.6 2.1 3.1 3.7 0 0-.9-2-2.6-4.3z"
        fill="#EDE9FE"
        opacity="0.9"
      />
      <circle
        cx="70"
        cy="150"
        r="9"
        fill={WHITE}
        stroke={OUTLINE}
        strokeWidth="2"
      />
      <circle
        cx="146"
        cy="116"
        r="8"
        fill={WHITE}
        stroke={OUTLINE}
        strokeWidth="2"
      />
      <rect x="128" y="107" width="34" height="7" rx="3.5" fill="#8B5A2B" />
      <rect x="128" y="107" width="7" height="7" rx="3" fill="#D9B48A" />
      <circle
        cx="166"
        cy="110.5"
        r="5"
        fill="none"
        stroke="#8B5A2B"
        strokeWidth="2"
      />
    </g>
    <rect x="40" y="140" width="30" height="26" rx="12" fill={LEATHER} />
    <rect x="150" y="140" width="30" height="26" rx="12" fill={LEATHER} />
    <rect x="56" y="158" width="108" height="22" rx="10" fill={LEATHER_LIGHT} />
    <rect x="60" y="178" width="8" height="16" rx="3" fill="#3B1A1A" />
    <rect x="152" y="178" width="8" height="16" rx="3" fill="#3B1A1A" />
    <g fill="#C4B5FD" fillOpacity="0.18" stroke={GLOW} strokeWidth="1.5">
      <circle className="don-bubble don-b1" cx="170" cy="100" r="6" />
      <circle className="don-bubble don-b2" cx="172" cy="96" r="9" />
      <circle className="don-bubble don-b3" cx="168" cy="102" r="5" />
      <circle className="don-bubble don-b4" cx="171" cy="98" r="7" />
    </g>
  </svg>
);

// An owner can do everything, so their permissions page has nothing to set.
export const OwnerPermissionNotice = () => {
  const { t } = useTranslation('settings');

  return (
    <div className="flex flex-col items-center gap-3 p-10 text-center">
      <ErxesBotDon />
      <p className="text-base font-semibold">{t('owner-permissions-title')}</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        {t('owner-permissions-hint')}
      </p>
    </div>
  );
};
