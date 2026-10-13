import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const KB_SIDEBAR_MIN_WIDTH = 180;
export const KB_SIDEBAR_MAX_WIDTH = 480;

export const kbSidebarWidthAtom = atomWithStorage<number | null>(
  'frontline:kb-sidebar-width',
  null,
  undefined,
  { getOnInit: true },
);

export const kbSidebarResizingAtom = atom(false);
