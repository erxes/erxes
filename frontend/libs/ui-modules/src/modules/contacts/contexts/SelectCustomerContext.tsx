import { ICustomer } from '../types';
import { createContext } from 'react';

export type ISelectCustomerContext = {
  customerIds: string[];
  onSelect: (customer: ICustomer) => void;
  customers: ICustomer[];
  setCustomers: (customers: ICustomer[]) => void;
  loading: boolean;
  error: string | null;
  hideAvatar?: boolean;
  mode: 'single' | 'multiple';
};

export const SelectCustomerContext =
  createContext<ISelectCustomerContext | null>(null);
