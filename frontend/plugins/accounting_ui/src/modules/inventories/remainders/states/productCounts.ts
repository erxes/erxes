import { atom } from 'jotai';

export const renderingProductDetailAtom = atom(false);

export const selectedProductIdsAtom = atom<string[]>([]);

export const selectedRemainderProductAtom = atom<{
  productId: string;
  productName: string;
  productCode: string;
  inventories: any;
  remainder: any;
} | null>(null);

export const productTotalCountAtom = atom<number | null>(null);
