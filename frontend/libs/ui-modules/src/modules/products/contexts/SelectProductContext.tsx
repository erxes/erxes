import { createContext, useContext } from 'react';
import { IProduct } from '../types/Product';

export type ISelectProductContext = {
  productIds: string[];
  onSelect: (product: IProduct) => void;
  products: IProduct[];
  setProducts: (products: IProduct[]) => void;
  loading: boolean;
  error: string | null;
};

export const SelectProductContext = createContext<ISelectProductContext | null>(
  null,
);

export const useSelectProductContext = () => {
  const context = useContext(SelectProductContext);
  if (!context) {
    throw new Error(
      'useSelectProductContext must be used within a SelectProductContextProvider',
    );
  }
  return context;
};
