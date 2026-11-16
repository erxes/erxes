import { atom } from 'jotai';
import { ICurrencyRate } from './types';

// 'new' opens the sheet empty; a rate opens it for editing
export const currencyRateSheetAtom = atom<ICurrencyRate | 'new' | null>(null);
