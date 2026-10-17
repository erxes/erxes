import type { TCompany } from '@/contacts/types/companyType';
import type { CellContext } from '@tanstack/react-table';
import type { ICustomer } from 'ui-modules';

export type CompanyCellContextValue = CellContext<TCompany, unknown>;
export type CustomerCellContextValue = CellContext<ICustomer, unknown>;
