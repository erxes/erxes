import { atom } from 'jotai';
import { IAccount } from '../types/Account';

export const accountDetailAtom = atom<IAccount | null>(null);
