import { atom } from 'jotai';

export const authorizedFacebookAccountAtom = atom<string | undefined>();

export const facebookFormSheetAtom = atom(false);
export const selectedFacebookAccountAtom = atom<string | undefined>();
export const selectedFacebookPageAtom = atom<string | undefined>();
export const activeFacebookFormStepAtom = atom<number>(1);

export const resetFacebookAddStateAtom = atom(undefined, (get, set) => {
  set(facebookFormSheetAtom, false);
  set(selectedFacebookAccountAtom, undefined);
  set(selectedFacebookPageAtom, undefined);
  set(activeFacebookFormStepAtom, 1);
});
