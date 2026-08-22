import { atom } from 'jotai';

export const whatsappFormSheetAtom = atom(false);
export const selectedWhatsappAccountAtom = atom<string | undefined>(undefined);
export const selectedWhatsappPageAtom = atom<string | undefined>(undefined);
export const selectedWhatsappBusinessAccountAtom = atom<string | undefined>(
  undefined,
);
export const selectedWhatsappPhoneNumberAtom = atom<string | undefined>(
  undefined,
);
export const activeWhatsappFormStepAtom = atom<number>(1);

export const resetWhatsappAddStateAtom = atom(undefined, (get, set) => {
  set(whatsappFormSheetAtom, false);
  set(selectedWhatsappAccountAtom, undefined);
  set(selectedWhatsappPageAtom, undefined);
  set(selectedWhatsappBusinessAccountAtom, undefined);
  set(selectedWhatsappPhoneNumberAtom, undefined);
  set(activeWhatsappFormStepAtom, 1);
});
