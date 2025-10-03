import { createContext, useContext } from 'react';
import { IBrand } from '../types/brand';

export type ISelectBrandContext = {
  brandIds: string[];
  brands: IBrand[];
  setBrands: (brands: IBrand[]) => void;
  onSelect: (brand: IBrand) => void;
  loading: boolean;
  error: string | null;
};

export const SelectBrandContext = createContext<ISelectBrandContext | null>(
  null,
);

export const useSelectBrandContext = () => {
  const context = useContext(SelectBrandContext);
  if (!context) {
    throw new Error(
      'useSelectBrandContext must be used within a SelectBrandProvider',
    );
  }
  return context;
};
