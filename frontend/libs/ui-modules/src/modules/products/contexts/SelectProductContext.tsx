import { createContext, useContext } from 'react';
import { IProduct } from '../types/Product';

export type ISelectProductContext = {
  productIds: string[];
  onSelect: (product: IProduct) => void;
  products: IProduct[];
  setProducts: (products: IProduct[]) => void;
  loading: boolean;
  error: string | null;
<<<<<<< HEAD
  defaultSearchValue?: string;
=======
  selectedProducts?: IProduct[];
>>>>>>> ec74e41336c8c90d023d7b76ecedd60a6dfef5f5
};

export const SelectProductContext =
  createContext<ISelectProductContext | null>(null);


export const useSelectProductContext = () => {
    const context = useContext(SelectProductContext);
    if (!context) {
        throw new Error('useSelectProductContext must be used within a SelectProductContextProvider');
    }
    return context;
}