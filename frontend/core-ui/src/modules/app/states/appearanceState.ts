import { atomWithStorage } from 'jotai/utils';

export type AppearanceLayout = 'default' | 'notch';
export type NotchColor = 'indigo' | 'graphite' | 'forest' | 'plum';

export const NOTCH_COLORS: Record<NotchColor, string> = {
  indigo: 'color-mix(in oklab, var(--primary) 55%, black)',
  graphite: 'oklch(0.27 0.005 270)',
  forest: 'oklch(0.32 0.045 160)',
  plum: 'oklch(0.3 0.06 330)',
};

export const appearanceLayoutState = atomWithStorage<AppearanceLayout>(
  'erxes-appearance-layout',
  'default',
);

export const notchColorState = atomWithStorage<NotchColor>(
  'erxes-appearance-notch-color',
  'indigo',
);
