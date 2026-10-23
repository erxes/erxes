import { atom } from 'jotai';

export const dealCreateSheetState = atom(false);
export const dealCreateDefaultValuesState = atom<Partial<any> | undefined>(
  undefined,
);
