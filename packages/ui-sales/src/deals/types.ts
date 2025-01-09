import { IItem, IItemParams } from '../boards/types';
import { IProduct } from '@erxes/ui-products/src/types';

export interface IQueryParams {
  brandIds: string;
  integrationIds: string;
  boardId: string;
  pipelineIds: string;
  endDate: string;
  startDate: string;
}
export interface IDealTotalAmount {
  _id: string;
  name: string;
  currencies: [
    {
      amount: number;
      name: string;
    }
  ];
}

export interface IDiscountValue {
  bonusName: string;
  discount: number;
  potentialBonus: number;
  sumDiscount: number;
  type: string;
  voucherCampaignId: string;
  voucherId: string;
  voucherName: string;
}
export interface IProductData {
  _id: string;
  productId?: string;
  product?: IProduct;
  uom?: string;
  currency?: string;
  quantity: number;
  unitPrice: number;
  globalUnitPrice: number;
  unitPricePercent: number;
  taxPercent: number;
  tax: number;
  vatPercent: number;
  discountPercent: number;
  discount: number;
  amount: number;
  tickUsed?: boolean;
  isVatApplied?: boolean;
  assignUserId?: string;
  maxQuantity: number;
  branchId?: string;
  departmentId?: string;
}

export interface IPaymentsData {
  [key: string]: {
    currency?: string;
    amount?: number;
  };
}

export type DealsTotalAmountsQueryResponse = {
  dealsTotalAmounts: IDealTotalAmount[];
  refetch: () => void;
};

export interface IDeal extends IItem {
  products?: any;
  paymentsData?: IPaymentsData;
}

export interface IDealParams extends IItemParams {
  productsData?: IProductData[];
  paymentsData?: IPaymentsData;
}

export type DealsQueryResponse = {
  deals: IDeal[];
  loading: boolean;
  refetch: () => void;
  fetchMore: any;
};

export type DealsTotalCountQueryResponse = {
  dealsTotalCount: number;
  loading: boolean;
  refetch: () => void;
  fetchMore: any;
};
