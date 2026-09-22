import { atom } from 'jotai';

import {
  MSDynamicCheckProduct,
  MSDynamicCheckProductsResponse,
  MSDynamicCheckProductStatus,
} from '../types/msDynamicCheckProduct';

export const productsAtom = atom<MSDynamicCheckProduct[] | null>(null);
export const productsDataAtom = atom<MSDynamicCheckProductsResponse | null>(
  null,
);
export const selectedFilterAtom = atom<MSDynamicCheckProductStatus>('create');
export const checkingAtom = atom(false);
export const syncingAtom = atom(false);
