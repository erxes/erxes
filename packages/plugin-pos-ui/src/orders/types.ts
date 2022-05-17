import { IOrdersSummary, QueryResponse } from "../types";
import { IUser } from '@erxes/ui/src/auth/types';
import {ICustomer} from '@erxes/ui/src/customers/types';
import { IProductCategory, IProduct } from '@erxes/ui-products/src/types';

export type IOrder = {
  _id: string,
  createdAt: Date,
  status: string,
  paidDate: Date,
  number: string,
  customerId: string,
  cardAmount: number,
  cashAmount: number,
  mobileAmount: number,
  totalAmount: number,
  finalAmount: number,
  shouldPrintEbarimt: boolean,
  printedEbarimt: boolean,
  billType: string,
  billId: string,
  registerNumber: string,
  oldBillId: string,
  type: string,
  userId: string,

  items: any,
  posToken: string,
  syncId: string,
  posName: string,
  user: IUser,
  customer: ICustomer,

  syncedErkhet: boolean,
}

export type IOrderDet = {
  putResponses: any[];
} & IOrder;

export type OrdersQueryResponse = {
  posOrders: IOrder[];
  loading: boolean;
  refetch: () => void;
}

export type OrderDetailQueryResponse = {
  posOrderDetail: IOrderDet;
  loading: boolean;
  refetch: () => void;
}

export type ListQueryVariables = {
  page?: number;
  perPage?: number;
  search?: string;
};

export type OrdersSummaryQueryResponse = {
  posOrdersSummary: IOrdersSummary;
  loading: boolean;
  refetch: () => void;
}

export type IPosProduct = {
  count: number;
  amount: number;
} & IProduct

export type PosProductsQueryResponse = {
  posProducts: { products: IPosProduct[]; totalCount: number };
} & QueryResponse;

export type ProductCategoriesQueryResponse = {
  productCategories: IProductCategory[];
} & QueryResponse;

// mutation
export type PosOrderSyncErkhetMutationResponse = {
  posOrderSyncErkhet: (mutation: { variables: { _id: string } }) => Promise<any>;
};

export type PosOrderReturnBillMutationResponse = {
  posOrderReturnBill: (mutation: { variables: { _id: string } }) => Promise<any>;
};

export type PosOrderChangePaymentsMutationResponse = {
  posOrderChangePayments: (mutation: {
    variables: {
      _id: string, cashAmount: number, cardAmount: number, mobileAmount: number
    }
  }) => Promise<any>;
};
