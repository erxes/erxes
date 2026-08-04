import { createContext, useContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { IBrand } from '../types/brand';

export interface IBrandsInlineContext {
  brands: IBrand[];
  loading: boolean;
  brandIds?: string[];
  placeholder: string;
  updateBrands?: Dispatch<SetStateAction<IBrand[]>>;
}

export const BrandsInlineContext = createContext<IBrandsInlineContext | null>(
  null,
);

export const useBrandsInlineContext = () => {
  const context = useContext(BrandsInlineContext);
  if (!context) {
    throw new Error(
      'useBrandsInlineContext must be used within a BrandsInlineProvider',
    );
  }
  return context;
};
