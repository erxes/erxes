import { IOrdersSummary, QueryResponse } from '../types';
import { IProduct, IProductCategory } from '@erxes/ui-products/src/types';

import { ICustomer } from '@erxes/ui-contacts/src/customers/types';
import { IUser } from '@erxes/ui/src/auth/types';

export type IOrder = {
  _id: string;
  createdAt: Date;
  status: string;
  paidDate: Date;
  number: string;
  customerId: string;
  cardAmount: number;
  cashAmount: number;
  receivableAmount: number;
  mobileAmount: number;
  totalAmount: number;
  finalAmount: number;
  shouldPrintEbarimt: boolean;
  printedEbarimt: boolean;
  billType: string;
  billId: string;
  registerNumber: string;
  oldBillId: string;
  type: string;
  userId: string;

  items: any;
  posToken: string;
  posName: string;
  user: IUser;
  customer: ICustomer;

  syncedErkhet: boolean;
};

export type IOrderDet = {
  putResponses: any[];
  deliveryInfo: any;
} & IOrder;

export type OrdersQueryResponse = {
  posOrders: IOrder[];
  loading: boolean;
  refetch: () => void;
};

export type OrderDetailQueryResponse = {
  posOrderDetail: IOrderDet;
  loading: boolean;
  refetch: () => void;
};

export type ListQueryVariables = {
  page?: number;
  perPage?: number;
  search?: string;
};

export type OrdersSummaryQueryResponse = {
  posOrdersSummary: IOrdersSummary;
  loading: boolean;
  refetch: () => void;
};

export type IPosProduct = {
  counts: any;
  count: number;
  amount: number;
} & IProduct;

export type PosProductsQueryResponse = {
  posProducts: { products: IPosProduct[]; totalCount: number };
} & QueryResponse;

export type ProductCategoriesQueryResponse = {
  productCategories: IProductCategory[];
} & QueryResponse;

// mutation
export type PosOrderSyncErkhetMutationResponse = {
  posOrderSyncErkhet: (mutation: {
    variables: { _id: string };
  }) => Promise<any>;
};

export type PosOrderReturnBillMutationResponse = {
  posOrderReturnBill: (mutation: {
    variables: { _id: string };
  }) => Promise<any>;
};

export type PosOrderChangePaymentsMutationResponse = {
  posOrderChangePayments: (mutation: {
    variables: {
      _id: string;
      cashAmount: number;
      receivableAmount: number;
      cardAmount: number;
      mobileAmount: number;
    };
  }) => Promise<any>;
};
