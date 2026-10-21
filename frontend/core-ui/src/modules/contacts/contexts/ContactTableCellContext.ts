import { createContext } from 'react';
import type {
  CompanyCellContextValue,
  CustomerCellContextValue,
} from '@/contacts/types/contactCells';

export const CompanyCellContext = createContext<CompanyCellContextValue | null>(
  null,
);
export const CustomerCellContext =
  createContext<CustomerCellContextValue | null>(null);
