import { atom } from 'jotai';
import { Keys } from 'react-hotkeys-hook/dist/types';

export const pendingHotkeyState = atom<Keys | null>(null);
