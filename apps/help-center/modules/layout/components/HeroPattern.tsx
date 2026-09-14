const Shapes = ({ id, className }: { id: string; className: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    viewBox="0 0 420 400"
    fill="none"
  >
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0.8" y2="1">
        <stop offset="0" stopColor="currentColor" stopOpacity="0.9" />
        <stop offset="1" stopColor="currentColor" stopOpacity="0.35" />
      </linearGradient>
    </defs>

    <g fill={`url(#${id})`}>
      <rect x="196" y="36" width="140" height="140" rx="16" />
      <circle cx="104" cy="250" r="66" />
    </g>

    <g
      className="text-hero-line"
      stroke="currentColor"
      strokeWidth="1.5"
      opacity="0.75"
    >
      <rect x="232" y="212" width="150" height="150" rx="16" />
      <circle cx="88" cy="96" r="58" />
    </g>
  </svg>
);

export const HeroPattern = () => (
  <>
    <Shapes
      id="hero-shapes-left"
      className="pointer-events-none absolute -left-40 -top-24 hidden h-[400px] w-[420px] -scale-x-100 text-hero-soft opacity-80 lg:block"
    />
    <Shapes
      id="hero-shapes-right"
      className="pointer-events-none absolute -right-40 -top-24 hidden h-[400px] w-[420px] text-hero-soft opacity-80 sm:block"
    />
  </>
);
