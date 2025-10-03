import { atom } from 'jotai';

import { HotkeyScope } from '../../types/HotkeyScope';
import { INITIAL_HOTKEYS_SCOPE } from '../../constants/initialHotkeysScope';

export const currentHotkeyScopeState = atom<HotkeyScope>(INITIAL_HOTKEYS_SCOPE);
