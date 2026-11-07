import type { DealProductData } from '@/deals/utils/dealJson';
import { createContext, useContext } from 'react';

import type { ProductDataWithDiscountInfos } from '@/deals/cards/components/detail/product/utils/discountInfos';

interface LocalChangeOptions {
  syncProductId?: string;
}

export type OnLocalChangeType = (
  id: string,
  patch: Partial<ProductDataWithDiscountInfos>,
  options?: LocalChangeOptions,
) => void;

export interface ProductRowActions {
  onEdit: (productData: DealProductData) => void;
  onDuplicate: (productData: DealProductData) => void;
  onDelete: (productData: DealProductData) => void;
}

interface ProductListHandlers {
  onLocalChange: OnLocalChangeType | null;
  rowActions: ProductRowActions | null;
}

export const ProductListHandlersContext = createContext<ProductListHandlers>({
  onLocalChange: null,
  rowActions: null,
});

export const useProductLocalChange = () =>
  useContext(ProductListHandlersContext).onLocalChange;

export const useProductRowActions = () =>
  useContext(ProductListHandlersContext).rowActions;
