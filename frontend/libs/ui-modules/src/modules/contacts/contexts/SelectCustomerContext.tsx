import { createContext } from 'react';
import { ICustomer } from '../types';

export type ISelectCustomerContext = {
  customerIds: string[];
  onSelect: (customer: ICustomer) => void;
  customers: ICustomer[];
  setCustomers: (customers: ICustomer[]) => void;
  loading: boolean;
  error: string | null;
};

export const SelectCustomerContext =
  createContext<ISelectCustomerContext | null>(null);
