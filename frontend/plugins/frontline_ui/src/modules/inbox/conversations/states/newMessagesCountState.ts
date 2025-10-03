import { atom } from 'jotai';

export const newMessagesCountState = atom<number>(0);
export const refetchNewMessagesState = atom(false);

export const resetNewMessagesState = atom(
  (get) => get(refetchNewMessagesState),
  (get, set) => {
    set(newMessagesCountState, 0);
    set(refetchNewMessagesState, false);
  },
);
