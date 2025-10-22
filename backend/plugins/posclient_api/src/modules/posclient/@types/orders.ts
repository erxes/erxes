import { Document } from 'mongoose';

import { IOrderItemDocument } from './orderItems';

export interface IPaidAmount {
  _id?: string;
  type: string;
  amount: number;
  info?: any;
}

export interface IMobileAmount {
  _id?: string;
  amount: number;
}

export interface IOrder {
  status?: string;
  saleStatus?: string;
  createdAt?: Date;
  modifiedAt?: Date;
  userId?: string;
  paidDate?: Date;
  dueDate?: Date;
  number?: string;
  customerId?: string;
  customerType?: string;
  cashAmount?: number;
  mobileAmount?: number;
  mobileAmounts?: IMobileAmount[];
  directDiscount?: number;
  directIsAmount?: boolean;
  paidAmounts?: IPaidAmount[];
  totalAmount: number;
  finalAmount?: number;
  shouldPrintEbarimt?: boolean;
  printedEbarimt?: boolean;
  billType?: string;
  billId?: string;
  registerNumber?: string;
  oldBillId?: string;
  type?: string;
  branchId?: string;
  departmentId?: string;
  subBranchId?: string;
  synced?: boolean;
  origin?: string;
  posToken?: string;
  subToken?: string;
  deliveryInfo?: any;
  description?: string;
  isPre?: boolean;

  //posSlot
  slotCode?: string;
  taxInfo?: any;
  convertDealId?: string;
  returnInfo?: any;

  //subscription
  subscriptionInfo?: {
    subscriptionId: string;
    status: string;
    prevSubscriptionId?: string;
  };
  closeDate?: Date;

  extraInfo?: any;
}

export interface IOrderDocument extends Document, IOrder {
  _id: string;
  items: IOrderItemDocument[];
}
