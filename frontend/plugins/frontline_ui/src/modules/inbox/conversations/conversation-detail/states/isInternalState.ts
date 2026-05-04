import { atom } from 'jotai';

export const isInternalState = atom(false);
export const onlyInternalState = atom(false);

/** When true the MessageInput is completely hidden (e.g. IMAP conversations use their own compose UI). */
export const hideMessageInputState = atom(false);
