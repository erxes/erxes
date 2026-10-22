import type { IProduct } from 'ui-modules';
import type { z } from 'zod';
import type { productTypeChangeSchema } from '@/products/constants/productTypeChangeSchema';

export type ProductTypeChangeValues = z.infer<typeof productTypeChangeSchema>;
export type ProductTypeChangeTarget = Pick<IProduct, '_id' | 'status'>;

export interface ProductsChangeTypeDialogProps {
  products: ProductTypeChangeTarget[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface UseProductsChangeTypeResult {
  apply: (values: ProductTypeChangeValues) => Promise<boolean>;
  saving: boolean;
  refreshPending: boolean;
}
