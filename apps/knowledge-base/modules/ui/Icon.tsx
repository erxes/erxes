import type { SVGProps } from 'react';

const paths = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  ),
  close: (
    <>
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </>
  ),
  chevronRight: <path d="m9 6 6 6-6 6" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  arrowLeft: (
    <>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </>
  ),
  article: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h4" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
    </>
  ),
  chart: (
    <>
      <path d="M3 21h18" />
      <path d="M7 17v-5" />
      <path d="M12 17V6" />
      <path d="M17 17v-8" />
    </>
  ),
  diamond: (
    <>
      <path d="m12 3 9 6-9 12L3 9z" />
      <path d="M3 9h18" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.5 3.8 5.6 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.6-3.8-9S9.5 5.5 12 3Z" />
    </>
  ),
  smile: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 14.5a5 5 0 0 0 7 0" />
      <path d="M9 9.5h.01" />
      <path d="M15 9.5h.01" />
    </>
  ),
  clipboard: (
    <>
      <path d="M9 4H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3" />
      <rect x="8" y="2.5" width="8" height="4" rx="1" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </>
  ),
  grid: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </>
  ),
  ticket: (
    <>
      <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z" />
      <path d="M14 6v2" />
      <path d="M14 11v2" />
      <path d="M14 16v2" />
    </>
  ),
  binoculars: (
    <>
      <path d="M9 3H7.5a2 2 0 0 0-2 1.6L4.5 11h5V3Z" />
      <path d="M15 3h1.5a2 2 0 0 1 2 1.6l1 6.4h-5V3Z" />
      <rect x="4" y="11" width="6" height="9" rx="3" />
      <rect x="14" y="11" width="6" height="9" rx="3" />
      <path d="M10 8h4" />
    </>
  ),
  megaphone: (
    <>
      <path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Z" />
      <path d="M15 8.5a5 5 0 0 1 0 7" />
      <path d="M18 5.5a9 9 0 0 1 0 13" />
    </>
  ),
  book: (
    <>
      <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
      <path d="M6 19h13v2H6a2 2 0 0 1 0-4" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  check: <path d="m5 13 4 4 10-10" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  paperclip: (
    <path d="M20 11.5 12.5 19a4.5 4.5 0 0 1-6.4-6.4l8-8a3 3 0 0 1 4.3 4.3l-8 8a1.5 1.5 0 0 1-2.2-2.1l7.3-7.3" />
  ),
  send: (
    <>
      <path d="M21 3 10.5 13.5" />
      <path d="m21 3-6.5 18-4-8-8-4z" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7.5 9 6 9-6" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  inbox: (
    <>
      <path d="M5 4h14l2 8v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6z" />
      <path d="M3 12h5l1 3h6l1-3h5" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ),
  alert: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5" />
      <path d="M12 16h.01" />
    </>
  ),
  star: (
    <path d="m12 3.6 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z" />
  ),
  wrench: (
    <path d="M17.6 3.4a4.5 4.5 0 0 0-5.9 5.6L4 16.7a2.1 2.1 0 0 0 3 3l7.7-7.7a4.5 4.5 0 0 0 5.6-5.9l-2.7 2.7-2.3-2.3z" />
  ),
  palette: (
    <>
      <path d="M12 3a9 9 0 0 0 0 18 2 2 0 0 0 1.6-3.2 2 2 0 0 1 1.6-3.2H18a3 3 0 0 0 3-3A9 9 0 0 0 12 3Z" />
      <circle cx="7.6" cy="12.4" r="1" />
      <circle cx="9.6" cy="8.4" r="1" />
      <circle cx="14" cy="7.4" r="1" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5.5A2.5 2.5 0 0 1 11.5 3h1A2.5 2.5 0 0 1 15 5.5V7" />
      <path d="M3 12h18" />
    </>
  ),
  bulb: (
    <>
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.4.9 1 .9 1.7V16h5.2v-.4c0-.7.3-1.3.9-1.7A6 6 0 0 0 12 3Z" />
      <path d="M9.6 19h4.8" />
      <path d="M10.5 21.5h3" />
    </>
  ),
  umbrella: (
    <>
      <path d="M12 3a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9Z" />
      <path d="M12 12v6.5a2.5 2.5 0 0 0 5 0" />
    </>
  ),
  puzzle: (
    <path d="M10 4.5a2 2 0 1 1 4 0V6h2.5a1 1 0 0 1 1 1v2.5H19a2 2 0 1 1 0 4h-1.5V17a1 1 0 0 1-1 1H14v1.5a2 2 0 1 1-4 0V18H6.5a1 1 0 0 1-1-1v-3.5H4a2 2 0 1 1 0-4h1.5V7a1 1 0 0 1 1-1H10z" />
  ),
  piggybank: (
    <>
      <path d="M4 12.5a6 6 0 0 1 6-6h3a6 6 0 0 1 5.6 3.9l1.9 1v3l-1.9.7A6 6 0 0 1 16 18v2h-3v-1.4h-3V20H7v-2.3a6 6 0 0 1-3-5.2Z" />
      <circle cx="9" cy="11.5" r="1" />
      <path d="M13 6.5V4.2" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.6v2.1M12 19.3v2.1M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M2.6 12h2.1M19.3 12h2.1M4.9 19.1l1.5-1.5M17.6 6.4l1.5-1.5" />
    </>
  ),
  scale: (
    <>
      <path d="M12 4v16" />
      <path d="M6.5 20h11" />
      <path d="M4 8.5h16" />
      <path d="M4 8.5 1.8 14h4.4z" />
      <path d="M20 8.5 17.8 14h4.4z" />
    </>
  ),
  alarm: (
    <>
      <circle cx="12" cy="13.5" r="7" />
      <path d="M12 10.5v3.4l2.4 1.4" />
      <path d="m4.2 5.4 2.4-2.2M19.8 5.4l-2.4-2.2" />
    </>
  ),
  piechart: (
    <>
      <path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5H12z" />
      <path d="M14.6 2.6a8.5 8.5 0 0 1 6.8 6.8h-6.8z" />
    </>
  ),
  paste: (
    <>
      <rect x="8.5" y="8" width="11.5" height="13" rx="2" />
      <path d="M16 8V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2.5" />
    </>
  ),
  home: (
    <>
      <path d="M3 11 12 4l9 7" />
      <path d="M5 10.2V19a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8.8" />
      <path d="M10 20v-5.5h4V20" />
    </>
  ),
  language: (
    <>
      <path d="M3 6h11" />
      <path d="M8.5 4v2" />
      <path d="M12 6c0 4.5-3.2 8-7 9" />
      <path d="M6 10c1 2.4 3.2 4.3 6 5" />
      <path d="m13 20 4-9 4 9" />
      <path d="M14.4 17h5.2" />
    </>
  ),
} as const;

export type IconName = keyof typeof paths;

export const iconNames = Object.keys(paths) as IconName[];

type IconProps = Omit<SVGProps<SVGSVGElement>, 'name'> & {
  name: IconName;
  size?: number;
};

export const Icon = ({ name, size = 20, ...props }: IconProps) => (
  <svg
    aria-hidden="true"
    focusable="false"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {paths[name]}
  </svg>
);
