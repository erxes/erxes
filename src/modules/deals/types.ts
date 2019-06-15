import { IItem, IItemParams } from 'modules/boards/types';
import { IActivityLogForMonth } from '../activityLogs/types';
import { IProduct, IProductDoc } from '../settings/productService/types';

export interface IDealTotalAmount {
  _id: string;
  dealCount: number;
  dealAmounts: [
    {
      _id: string;
      amount: number;
      currency: string;
    }
  ];
}

export interface IProductData {
  _id: string;
  productId?: string;
  product?: IProduct;
  uom?: string;
  currency?: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  tax: number;
  discountPercent: number;
  discount: number;
  amount: number;
}

export type DealsTotalAmountsQueryResponse = {
  dealsTotalAmounts: IDealTotalAmount;
  refetch: () => void;
};

export type ActivityLogQueryResponse = {
  activityLogs: IActivityLogForMonth[];
  loading: boolean;
};

export type ProductsQueryResponse = {
  loading: boolean;
  refetch: (variables?: { searchValue?: string; perPage?: number }) => void;
  products: IProduct[];
};

export type ProductAddMutationResponse = {
  productAdd: (params: { variables: IProductDoc }) => Promise<void>;
};

export interface IDeal extends IItem {
  products?: any;
}

export interface IDealParams extends IItemParams {
  productsData?: IProductData[];
}

export type DealsQueryResponse = {
  deals: IDeal[];
  loading: boolean;
  refetch: () => void;
  fetchMore: any;
};
