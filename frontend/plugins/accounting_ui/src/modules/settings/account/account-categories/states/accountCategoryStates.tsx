import { atom } from 'jotai';
import { IAccountCategory } from '../types/AccountCategory';

export const accountCategoryDetailAtom = atom<IAccountCategory | null>(null);
