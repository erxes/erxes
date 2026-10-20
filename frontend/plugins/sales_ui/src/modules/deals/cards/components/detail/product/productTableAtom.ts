import type { DealProductData } from '@/deals/utils/dealJson';
import { atom } from 'jotai';

import { ProductDataWithDiscountInfos } from './utils/discountInfos';

interface LocalChangeOptions {
  syncProductId?: string;
}

type OnLocalChangeType = (
  id: string,
  patch: Partial<ProductDataWithDiscountInfos>,
  options?: LocalChangeOptions,
) => void;

export const onLocalChangeAtom = atom<OnLocalChangeType | null>(null);

export interface ProductRowActions {
  onEdit: (productData: DealProductData) => void;
  onDuplicate: (productData: DealProductData) => void;
  onDelete: (productData: DealProductData) => void;
}

export const productRowActionsAtom = atom<ProductRowActions | null>(null);
