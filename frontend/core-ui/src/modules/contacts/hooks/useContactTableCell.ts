import {
  CompanyCellContext,
  CustomerCellContext,
} from '@/contacts/contexts/ContactTableCellContext';
import type {
  CompanyCellContextValue,
  CustomerCellContextValue,
} from '@/contacts/types/contactCells';
import { useContext } from 'react';

export const useCompanyCell = (): CompanyCellContextValue => {
  const cell = useContext(CompanyCellContext);
  if (!cell)
    throw new Error(
      'Company cells must be rendered within their table cell context',
    );
  return cell;
};

export const useCustomerCell = (): CustomerCellContextValue => {
  const cell = useContext(CustomerCellContext);
  if (!cell)
    throw new Error(
      'Customer cells must be rendered within their table cell context',
    );
  return cell;
};
