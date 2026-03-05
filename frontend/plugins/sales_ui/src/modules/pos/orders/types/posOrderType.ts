import { POS_ORDER_FORM_SCHEMA } from '../constants/posOrderSchema';
import { z } from 'zod';

export interface TPosOrderForm {
  cashAmount: number;
  mobileAmount: number;
  spendPoints: number;
  name?: string;
  description?: string;
}

export type TPosOrderFormData = z.infer<typeof POS_ORDER_FORM_SCHEMA>;

export interface TPosOrder {
  _id: string;
  createdAt: string;
  status: string;
  paidDate?: string;
  dueDate?: string;
  number: string;
  customerId?: string;
  customerType?: string;
  cashAmount: number;
  mobileAmount: number;
  paidAmounts: Array<{
    amount: number;
    type: string;
  }>;
  totalAmount: number;
  finalAmount: number;
  shouldPrintEbarimt?: boolean;
  printedEbarimt?: boolean;
  billType?: string;
  billId?: string;
  registerNumber?: string;
  oldBillId?: string;
  type?: string;
  userId?: string;
  items?: any[];
  posToken?: string;
  posName?: string;
  branchId?: string;
  departmentId?: string;
  subBranchId?: string;
  branch?: any;
  department?: any;
  subBranch?: any;
  syncedErkhet?: any;
  description?: string;
  isPre?: boolean;
  origin?: string;
  convertDealId?: string;
  returnInfo?: any;
  syncErkhetInfo?: any;
  putResponses?: any[];
  deliveryInfo?: any;
  deal?: any;
  dealLink?: string;
}
