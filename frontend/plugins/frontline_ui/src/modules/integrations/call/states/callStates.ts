import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const historyIdAtom = atomWithStorage<string | null>(
  'callHistoryId',
  null,
);

export const currentCallConversationIdAtom = atom<string | null>(null);

export const inCallViewAtom = atom<string | null>(null);

export const callDurationAtom = atom<Date | null>(null);
