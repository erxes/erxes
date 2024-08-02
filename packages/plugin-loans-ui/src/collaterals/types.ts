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

export interface ICollateralTypeConfig {
  minPercent: number;
  maxPercent: number;
  defaultPercent: number;
  riskClosePercent: number;
  collateralType: string;
}

export interface ICollateralType {
  code: string;
  name: string;
  description: string;
  type: string;
  startDate: Date;
  endDate: Date;
  status: string;
  currency: string;
  config?: ICollateralTypeConfig;
  property?: ICollateralProperty;
}

export interface ICollateralProperty {
  sizeSquare: boolean;
  sizeSquareUnit: boolean;
  cntRoom: boolean;
  startDate: boolean;
  endDate: boolean;
  quality: boolean;
  purpose: boolean;
  mark: boolean;
  color: boolean;
  power: boolean;
  frameNumber: boolean;
  importedDate: boolean;
  factoryDate: boolean;
  courtOrderDate: boolean;
  mrtConfirmedDate: boolean;
  cmrtRegisteredDate: boolean;
  mrtRegisteredDate: boolean;
  courtOrderNo: boolean;
  mrtOrg: boolean;
  registeredToAuthority: boolean;
  causeToShiftTo: boolean;
}

export interface ICollateralTypeDocument extends ICollateralType {
  _id: string;
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
