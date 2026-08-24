/** Decorative geometry behind the portal hero. */
export const HeroPattern = () => (
  <svg
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 h-full w-full"
    viewBox="0 0 1440 420"
    preserveAspectRatio="xMidYMid slice"
  >
    <g className="text-hero-soft" fill="currentColor">
      <rect x="118" y="196" width="224" height="224" rx="12" />
      <path d="M342 84a112 112 0 0 1-112 112V84z" />
      <circle cx="500" cy="292" r="86" />
      <rect x="1004" y="40" width="180" height="180" rx="90" />
      <path d="M1440 0v120a120 120 0 0 1-120-120z" />
      <rect x="1160" y="188" width="320" height="232" rx="12" />
      <path d="M1004 420V300a120 120 0 0 1 120 120z" />
      <rect x="640" y="0" width="150" height="150" rx="12" />
    </g>
    <g
      className="text-hero-line"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="230" y="60" width="180" height="180" rx="12" />
      <circle cx="1100" cy="330" r="96" />
      <path d="M790 0v150a150 150 0 0 1-150-150" />
    </g>
  </svg>
);
