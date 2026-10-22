import type { IProduct } from 'ui-modules';
import type { z } from 'zod';
import type { productTypeChangeSchema } from '@/products/constants/productTypeChangeSchema';

export type ProductTypeChangeValues = z.infer<typeof productTypeChangeSchema>;
export type ProductTypeChangeTarget = Pick<IProduct, '_id' | 'status'>;

export interface ProductsChangeTypeContentProps {
  products: ProductTypeChangeTarget[];
  changeType: UseProductsChangeTypeResult;
  onClose: () => void;
}

export interface UseProductsChangeTypeResult {
  apply: (values?: ProductTypeChangeValues) => Promise<boolean>;
  saving: boolean;
  refreshPending: boolean;
}
