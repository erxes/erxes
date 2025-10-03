import { createContext, useContext } from 'react';
import { ICustomer } from '../types';

export interface ICustomersInlineContext {
  customers?: ICustomer[];
  loading: boolean;
  customerIds?: string[];
  placeholder: string;
  updateCustomers?: (customers: ICustomer[]) => void;
  getCustomerTitle: (customer?: ICustomer) => string;
}

export const CustomersInlineContext =
  createContext<ICustomersInlineContext | null>(null);

export const useCustomersInlineContext = () => {
  const context = useContext(CustomersInlineContext);
  if (!context) {
    throw new Error(
      'useCustomersInlineContext must be used within a CustomersInlineProvider',
    );
  }
  return context;
};
