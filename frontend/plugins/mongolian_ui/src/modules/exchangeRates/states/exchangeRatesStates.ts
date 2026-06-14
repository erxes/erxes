import { atom } from 'jotai';
import { IExchangeRate } from '../types';

export const exchangeRateDetailAtom = atom<IExchangeRate | null>(null);
