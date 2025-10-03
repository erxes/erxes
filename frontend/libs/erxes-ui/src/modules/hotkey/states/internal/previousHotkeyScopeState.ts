import { atom } from 'jotai';
import { HotkeyScope } from '../../types/HotkeyScope';

export const previousHotkeyScopeState = atom<HotkeyScope | null>(null);
