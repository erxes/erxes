import { atom } from 'jotai';
import type { Keys } from 'react-hotkeys-hook/dist/types';

export const pendingHotkeyState = atom<Keys | null>(null);
