import { atom } from 'jotai';

export const instagramFormSheetAtom = atom(false);
export const selectedInstagramAccountAtom = atom<string | undefined>(undefined);
export const selectedInstagramPageAtom = atom<string | undefined>(undefined);
export const activeInstagramFormStepAtom = atom<number>(1);

export const resetInstagramAddStateAtom = atom(undefined, (get, set) => {
  set(instagramFormSheetAtom, false);
  set(selectedInstagramAccountAtom, undefined);
  set(selectedInstagramPageAtom, undefined);
  set(activeInstagramFormStepAtom, 1);
});
