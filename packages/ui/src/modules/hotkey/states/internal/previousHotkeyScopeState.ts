import { atom } from 'jotai';
import type { HotkeyScope } from '../../types/HotkeyScope';

export const previousHotkeyScopeState = atom<HotkeyScope | null>(null);
