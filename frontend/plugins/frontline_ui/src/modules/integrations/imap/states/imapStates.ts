import { atom } from 'jotai';

export const imapFormSheetAtom = atom(false);

export const resetImapAddStateAtom = atom(undefined, (get, set) => {
  set(imapFormSheetAtom, false);
});
