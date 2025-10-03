import { atom } from 'jotai';
import { IVatRow } from '../types/VatRow';

export const vatRowDetailAtom = atom<IVatRow | null>(null);
