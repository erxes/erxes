import { atom } from 'jotai';
import { IAddTriage } from '@/triage/types/triage';

export const triageCreateSheetState = atom(false);
export const triageCreateDefaultValuesState = atom<
  Partial<IAddTriage> | undefined
>(undefined);
