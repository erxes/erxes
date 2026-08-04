export interface IMSDynamicCheckOrder {
  _id: string;
  number: string;
  createdAt: string;
  paidDate: string;
  totalAmount: number;
  brandId?: string;
}

export interface ICheckSyncedOrderStatus {
  _id: string;
  isSynced: boolean;
  syncedDate: string | null;
  syncedBillNumber: string | null;
  syncedCustomer: string | null;
}

export interface ISyncedOrderInfo {
  syncedBillNumber: string;
  syncedDate: string;
  syncedCustomer: string;
}

export interface IOrderCustomer {
  _id: string;
  code?: string;
  firstName?: string;
  lastName?: string;
  primaryEmail?: string;
  primaryPhone?: string;
}

export interface IOrderItem {
  _id: string;
  productName?: string;
  count?: number;
  unitPrice?: number;
  discountAmount?: number;
}

export interface IPaidAmount {
  _id: string;
  type: string;
  amount: number;
}

export interface IPutResponse {
  billId: string;
  date: string;
}

export interface IUserInfo {
  _id: string;
  email?: string;
}

export interface IDealInfo {
  _id: string;
  name?: string;
}

export interface IPosOrderDetail {
  _id: string;
  createdAt?: string;
  status?: string;
  paidDate?: string;
  number?: string;
  customerId?: string;
  customerType?: string;
  cashAmount?: number;
  mobileAmount?: number;
  paidAmounts?: IPaidAmount[];
  totalAmount?: number;
  finalAmount?: number;
  shouldPrintEbarimt?: boolean;
  printedEbarimt?: boolean;
  billType?: string;
  billId?: string;
  registerNumber?: string;
  oldBillId?: string;
  type?: string;
  userId?: string;
  items?: IOrderItem[];
  posToken?: string;
  syncedErkhet?: boolean;
  posName?: string;
  origin?: string;
  user?: IUserInfo;
  convertDealId?: string;
  customer?: IOrderCustomer;
  syncErkhetInfo?: string;
  putResponses?: IPutResponse[];
  deliveryInfo?: { description?: string };
  deal?: IDealInfo;
  dealLink?: string;
}
