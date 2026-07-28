import { atom } from 'jotai';
import { IProductData } from 'ui-modules';

type OnLocalChangeType = (id: string, patch: Partial<IProductData>) => void;

export const onLocalChangeAtom = atom<OnLocalChangeType | null>(null);

export interface ProductRowActions {
  onEdit: (productData: IProductData) => void;
  onDuplicate: (productData: IProductData) => void;
  onDelete: (productData: IProductData) => void;
}

export const productRowActionsAtom = atom<ProductRowActions | null>(null);
