export interface IUser {
  _id: string;
  email?: string;
  details: {
    avatar: string;
    fullName: string;
    __typename: string;
  };
  __typename: string;
}

export interface IOrder {
  _id: string;
  createdAt?: string;
  status?: string;
  paidDate?: string;
  dueDate?: string;
  number: string;
  customerId?: string;
  customerType?: string;
  cashAmount?: number;
  mobileAmount?: number;
  paidAmounts?: any;
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
  items?: any;
  posToken?: string;
  branchId?: string;
  departmentId?: string;
  branch?: any;
  department?: any;
  syncedErkhet?: boolean;
  description?: string;
  isPre?: boolean;
  posName?: string;
  origin?: string;
  user?: IUser;
  convertDealId?: string;
  returnInfo?: any;
  icon?: string;
  date?: string;
  loyalty?: string;
  invoice?: string;
  amount?: string;
  customer?: string;
  actions?: string;
}
