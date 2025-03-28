import { QueryResponse } from '../types';
import { IProduct, IProductCategory } from '@erxes/ui-products/src/types';
import { IUser } from '@erxes/ui/src/auth/types';

export type IOrder = {
  _id: string;
  createdAt: Date;
  status: string;
  paidDate: Date;
  number: string;
  customerId: string;
  customerType: string;
  cashAmount: number;
  paidAmounts: any;
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
  branchId: string;
  departmentId: string;

  branch: any;
  department: any;

  items: any;
  posToken: string;
  posName: string;
  user: IUser;
  customer: {
    _id: string;
    code: string;
    primaryPhone: string;
    firstName: string;
    primaryEmail: string;
    lastName: string;
  };
  description: string;
  isPre: boolean;
  origin?: string;
  syncedErkhet: boolean;
  convertDealId: string;
  returnInfo?: any;
};

export type IOrderRecord = {} & IOrder;

export type IOrderDet = {
  syncErkhetInfo: string;
  putResponses: any[];
  deliveryInfo: any;
  deal: any;
  dealLink?: string;
} & IOrder;

export type OrdersQueryResponse = {
  posOrders: IOrder[];
  loading: boolean;
  refetch: () => void;
};

export type OrderRecordsQueryResponse = {
  posOrderRecords: IOrderRecord[];
  loading: boolean;
  refetch: () => void;
};

export type OrderRecordsCountQueryResponse = {
  posOrderRecordsCount: number;
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
  posOrdersSummary: any;
  loading: boolean;
  refetch: () => void;
};

export type OrdersGroupSummaryQueryResponse = {
  posOrdersGroupSummary: any;
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
      mobileAmount: number;
      paidAmounts: any[];
    };
  }) => Promise<any>;
};

export interface ICoverSummary {
  _id?: string;
  kind: string;
  kindOfVal: number;
  value: number;
  amount: number;
}

export interface ICoverDetail {
  _id?: string;
  paidType: string;
  paidSummary: ICoverSummary[];
  paidDetail: any;
}

export type ICover = {
  _id?: string;
  posToken: string;
  status: string;
  beginDate: Date;
  endDate: Date;
  description: string;
  userId: string;
  details: ICoverDetail[];
  createdAt: Date;
  createdBy: string;
  modifiedAt: Date;
  modifiedBy: string;
  note?: string;
  posName: string;

  user: IUser;
  createdUser: IUser;
  modifiedUser: IUser;
};

export type OrdersByCustomer = {
  _id: string;
  customerType: string;
  customerDetail: any;
  orders: IOrder[];
  totalOrders: number;
  totalAmount: number;
};

export type PosOrdersBySub = {
  _id: string;
  customerType: string;
  customerId: string;
  customer: any;
  status: string;
  closeDate: string;
};

export type CoversQueryResponse = {
  posCovers: ICover[];
  loading: boolean;
  refetch: () => void;
};

export type CoversCountQueryResponse = {
  posCoversCount: number;
  loading: boolean;
  refetch: () => void;
};

export type OrderByCustomersQueryResponse = {
  posOrderCustomers: OrdersByCustomer[];
  posOrderCustomersTotalCount: number;
} & QueryResponse;

export type OrderBySubsQueryResponse = {
  posOrderBySubscriptions: PosOrdersBySub[];
  posOrderBySubscriptionsTotalCount:number
} & QueryResponse;

export type CoverDetailQueryResponse = {
  posCoverDetail: ICover;
  loading: boolean;
  refetch: () => void;
};

export type PosCoverEditNoteMutationResponse = {
  coversEdit: (mutation: {
    variables: {
      _id: string;
      note: string;
    };
  }) => Promise<any>;
};

export type RemoveCoverMutationResponse = {
  removeCover: (mutation: { variables: { _id: string } }) => Promise<any>;
};
