import { atom } from 'jotai';
import { IProductData } from 'ui-modules';

interface LocalChangeOptions {
  syncProductId?: string;
}

type OnLocalChangeType = (
  id: string,
  patch: Partial<IProductData>,
  options?: LocalChangeOptions,
) => void;

export const onLocalChangeAtom = atom<OnLocalChangeType | null>(null);

export interface ProductRowActions {
  onEdit: (productData: IProductData) => void;
  onDuplicate: (productData: IProductData) => void;
  onDelete: (productData: IProductData) => void;
}

export const productRowActionsAtom = atom<ProductRowActions | null>(null);
