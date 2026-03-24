// atoms.ts
import { atom } from 'jotai';

export const refetchConversationsAtom = atom<(() => void) | null>(null);
