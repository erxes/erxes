import { atom } from 'jotai';
import { IConnection } from '@/settings/connections/types';

export type TConnectionSheet =
  | { mode: 'create' }
  | { mode: 'edit'; connection: IConnection };

// The open create/edit sheet; the header and the table's rows set it.
export const connectionSheetAtom = atom<TConnectionSheet | null>(null);
