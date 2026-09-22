import { atom } from 'jotai';

// Per-session focus mode, not a stored preference.
export const conversationListHiddenState = atom<boolean>(false);
