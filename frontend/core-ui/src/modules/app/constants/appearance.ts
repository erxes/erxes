import { CSSProperties } from 'react';

// notch and sidebar both put the navigation on a colored frame. Allowed
// values must match the backend `Users.configAppearance` check.
export const APPEARANCE_LAYOUTS = ['default', 'notch', 'sidebar'] as const;
export type AppearanceLayout = (typeof APPEARANCE_LAYOUTS)[number];

// Which edge the navigation sits on in a framed layout: start is top (notch)
// or left (sidebar), end is bottom or right. Must match the backend check.
export const NAV_POSITIONS = ['start', 'end'] as const;
export type NavPosition = (typeof NAV_POSITIONS)[number];

export type FrameEffect = 'aurora' | 'snow' | 'petals';

// Each frame has a light and a dark tone; the `.dark` class picks one in CSS
// (see `.frame-fill` in styles.css), so no theme lookup happens in JS.
export type FrameStyle = {
  light: string;
  dark: string;
  effect?: FrameEffect;
  // Settings swatch when the fill alone hides the effect.
  swatch?: string;
};

export const FRAME_COLORS = {
  indigo: {
    light: 'oklch(0.9 0.045 277)',
    dark: 'color-mix(in oklab, var(--primary) 55%, black)',
  },
  graphite: { light: 'oklch(0.92 0.004 270)', dark: 'oklch(0.27 0.005 270)' },
  forest: { light: 'oklch(0.91 0.035 160)', dark: 'oklch(0.32 0.045 160)' },
  plum: { light: 'oklch(0.91 0.035 330)', dark: 'oklch(0.3 0.06 330)' },
} satisfies Record<string, FrameStyle>;

export const FRAME_THEMES = {
  erxes: {
    light: 'oklch(0.94 0.03 277)',
    dark: 'oklch(0.22 0.08 277)',
    effect: 'aurora',
    swatch:
      'linear-gradient(135deg, oklch(0.55 0.25 295), oklch(0.6 0.15 220), oklch(0.55 0.22 340))',
  },
  'new-year': {
    light:
      'linear-gradient(180deg, oklch(0.95 0.02 240), oklch(0.89 0.04 240))',
    dark: 'linear-gradient(180deg, oklch(0.22 0.06 255), oklch(0.3 0.07 240))',
    effect: 'snow',
  },
  'march-8': {
    light: 'linear-gradient(180deg, oklch(0.95 0.025 350), oklch(0.9 0.05 10))',
    dark: 'linear-gradient(180deg, oklch(0.3 0.08 350), oklch(0.36 0.1 10))',
    effect: 'petals',
  },
} satisfies Record<string, FrameStyle>;

export type FrameColor =
  | keyof typeof FRAME_COLORS
  | keyof typeof FRAME_THEMES
  | 'seasonal';

const FRAME_STYLES: Record<Exclude<FrameColor, 'seasonal'>, FrameStyle> = {
  ...FRAME_COLORS,
  ...FRAME_THEMES,
};

export const isAppearanceLayout = (
  value?: string | null,
): value is AppearanceLayout =>
  APPEARANCE_LAYOUTS.includes(value as AppearanceLayout);

export const isNavPosition = (value?: string | null): value is NavPosition =>
  NAV_POSITIONS.includes(value as NavPosition);

export const isFrameColor = (value?: string | null): value is FrameColor =>
  !!value &&
  (value === 'seasonal' ||
    Object.prototype.hasOwnProperty.call(FRAME_STYLES, value));

// Seasonal follows the calendar: New Year Dec 15–Jan 10, March 8 Mar 1–10.
export const seasonalFrameTheme = (date: Date): keyof typeof FRAME_THEMES => {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 12 && day >= 15) || (month === 1 && day <= 10)) {
    return 'new-year';
  }

  if (month === 3 && day <= 10) {
    return 'march-8';
  }

  return 'erxes';
};

export const resolveFrameStyle = (
  frameColor: FrameColor,
  date: Date = new Date(),
): FrameStyle =>
  FRAME_STYLES[
    frameColor === 'seasonal' ? seasonalFrameTheme(date) : frameColor
  ];

// CSS variables for a `.frame-fill` element.
export const frameFillVars = (style: FrameStyle): CSSProperties =>
  ({
    '--frame-light': style.light,
    '--frame-dark': style.dark,
  } as CSSProperties);
