import { atom } from 'jotai';
import { ICtaxRow } from '../types/CtaxRow';

export const ctaxRowDetailAtom = atom<ICtaxRow | null>(null);
