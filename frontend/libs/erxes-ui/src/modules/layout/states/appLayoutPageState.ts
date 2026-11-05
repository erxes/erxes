import { atom } from 'jotai';

export const appLayoutPageTargetState = atom<HTMLDivElement | null>(null);
export const appLayoutPageOverlayState = atom(false);
