import { createContext, useContext } from 'react';
import { IProduct } from '../types';

export interface IProductsInlineContext {
  products: IProduct[];
  loading: boolean;
  productIds?: string[];
  placeholder: string;
  updateProducts?: (products: IProduct[]) => void;
}

export const ProductsInlineContext =
  createContext<IProductsInlineContext | null>(null);

export const useProductsInlineContext = () => {
  const context = useContext(ProductsInlineContext);
  if (!context) {
    throw new Error(
      'useProductsInlineContext must be used within a ProductsInlineProvider',
    );
  }
  return context;
};
