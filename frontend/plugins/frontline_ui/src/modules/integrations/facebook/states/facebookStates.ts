import { atom } from 'jotai';

export const facebookFormSheetAtom = atom(false);
export const selectedFacebookAccountAtom = atom<string | undefined>(undefined);
export const selectedFacebookPageAtom = atom<string | undefined>(undefined);
export const activeFacebookFormStepAtom = atom<number>(1);

export const resetFacebookAddStateAtom = atom(undefined, (get, set) => {
  set(facebookFormSheetAtom, false);
  set(selectedFacebookAccountAtom, undefined);
  set(selectedFacebookPageAtom, undefined);
  set(activeFacebookFormStepAtom, 1);
});
