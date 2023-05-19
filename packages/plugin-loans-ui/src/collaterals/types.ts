import { IProduct, IProductCategory } from '@erxes/ui-products/src/types';

import { ICompany } from '@erxes/ui-contacts/src/companies/types';

export interface ICollateralDataDoc {
  _id: string;
  collateralId: string;
  cost: number;
  percent: number;
  leaseAmount: number;
  insuranceTypeId: string;
  currency: string;
  insuranceAmount: number;
  certificate: string;
  vinNumber: string;
}

export interface ICollateral {
  _id: string;
  status?: string;
  createdAt: Date;
  number?: string;
  description?: string;
  leaseAmount?: number;
  tenor: number;
  interestRate: number;
  repayment: string;
  startDate: Date;
  scheduleDay: number;
  collateralsData: JSON;
  collateralData?: ICollateralDataDoc;

  category: IProductCategory;
  vendor: ICompany;
  product: IProduct;
  contractId: string;
}

// query types

export type ListQueryVariables = {
  page?: number;
  perPage?: number;
  categoryId?: string;
  productIds?: string[];
  ids?: string[];
  searchValue?: string;
  sortField?: string;
  sortDirection?: number;
};

export type MainQueryResponse = {
  collateralsMain: { list: ICollateral[]; totalCount: number };
  loading: boolean;
};
