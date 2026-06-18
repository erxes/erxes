import { atom } from 'jotai';
import {
  IPriceItem,
  ICheckPriceResponse,
  PriceStatus,
} from '../types/checkPrice';

export const priceItemsAtom = atom<IPriceItem[] | null>(null);
export const checkResponseDataAtom = atom<ICheckPriceResponse | null>(null);
export const selectedFilterAtom = atom<PriceStatus | null>('UPDATE');
export const checkingAtom = atom(false);
export const syncingAtom = atom(false);
