import { IAttachment } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';

export interface IPosOrderItem {
  createdAt?: Date;
  productId: string;
  count: number;
  unitPrice?: number;
  discountAmount?: number;
  discountPercent?: number;
  bonusCount?: number;
  bonusVoucherId?: string;
  isPackage?: boolean;
  isTake?: boolean;
  manufacturedDate?: string;
  description?: string;
  attachment?: IAttachment;
  closeDate?: Date;
}
export interface IPosOrderItemDocument extends IPosOrderItem, Document {
  _id: string;
}
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

export interface IPosOrder {
  createdAt: Date;
  status: string;
  paidDate?: Date;
  dueDate?: Date;
  number: string;
  customerId?: string;
  customerType?: string;
  cashAmount?: number;
  mobileAmount?: number;
  mobileAmounts: IMobileAmount[];
  paidAmounts?: IPaidAmount[];
  totalAmount?: number;
  finalAmount?: number;
  shouldPrintEbarimt?: boolean;
  printedEbarimt?: boolean;
  billType?: string;
  billId?: string;
  registerNumber?: string;
  oldBillId?: string;
  type: string;
  userId?: string;
  items?: IPosOrderItem[];
  branchId: string;
  subBranchId: string;
  departmentId: string;
  posToken: string;
  syncedErkhet?: boolean;
  syncErkhetInfo?: string;
  deliveryInfo?: any;
  description?: string;
  isPre?: boolean;
  origin?: string;
  taxInfo?: any;
  convertDealId?: string;
  returnInfo?: any;
  subscriptionInfo?: {
    subscriptionId: string;
    status: string;
  };
  extraInfo?: any;
}
export interface IPosOrderDocument extends IPosOrder, Document {
  _id: string;
}

export interface IProductGroup {
  name: string;
  description: string;
  posId: string;
  categoryIds?: string[];
  excludedCategoryIds?: string[];
  excludedProductIds: string[];
}
export interface IProductGroupDocument extends IProductGroup, Document {
  _id: string;
}

export interface IPosSlot {
  _id?: string;
  posId: string;
  name: string;
  code: string;
  option: { [key: string]: number | string | boolean };
}

export interface IPosSlotDocument extends IPosSlot, Document {
  _id: string;
}
