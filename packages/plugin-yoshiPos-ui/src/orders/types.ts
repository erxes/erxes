import { IUser } from 'modules/auth/types';
import { QueryResponse, ICustomField } from 'types';

export interface IOrderItem {
  _id: string;
  createdAt?: Date;
  productId: string;
  count: number;
  unitPrice: number;
  discountAmount?: number;
  discountPercent?: number;
  orderId: string;
  productName: string;
  isPackage?: boolean;
  isTake?: boolean;
}

export interface IQPayInvoice {
  _id: string;
  senderInvoiceNo: string;
  amount: string;
  qpayInvoiceId: string;
  qrText: string;
  qpayPaymentId: string;
  paymentDate: Date;
  createdAt: Date;
  status: string;
}

export interface IPaymentInput {
  _id: string;
  cashAmount?: number;
  cardAmount?: number;
  cardInfo?: any;
}

export interface IOrder {
  _id: string;
  status: string;
  createdAt: Date;
  modifiedAt: Date;
  paidDate: Date;
  number: string;
  customerId?: string;
  cardAmount: number;
  cashAmount: number;
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
  cardPayments?: any[];
  origin?: string;

  items: IOrderItem[];
  customer?: ICustomer;
  user: IUser;
  putResponses?: IPutResponse[];
  qpayInvoices: IQPayInvoice[];
}

interface IProductCommonFields {
  _id: string;
  name: string;
  code: string;
  description?: string;
  attachment?: IAttachment;
}

export interface IProduct extends IProductCommonFields {
  categoryId?: string;
  type?: string;
  unitPrice?: number;
  status?: string;

  sku?: string;
  customFieldsData?: ICustomField[];
  tagIds?: string[];
  vendorId?: string;
  vendorCode?: string;
  mergedIds?: string[];
}

export interface IProductCategory extends IProductCommonFields {
  order: string;
  parentId?: string;
}

export interface IOrderItemInput {
  _id: string;
  count: number;
  productId: string;
  productName: string;
  unitPrice?: number;
  productImgUrl?: string;
  isPackage?: boolean;
  isTake?: boolean;
}

export type OrdersAddMutationResponse = ({ variables: any }) => Promise<any>;

export type OrdersEditMutationResponse = ({ variables: any }) => Promise<any>;

export type OrderChangeStatusMutationResponse = ({
  variables: any
}) => Promise<any>;

export type OrderDetailQueryResponse = {
  orderDetail: IOrder;
} & QueryResponse;

export type OrderQueryResponse = {
  orders: IOrder[];
} & QueryResponse;

export type FullOrderQueryResponse = {
  fullOrders: IOrder[];
  subscribeToMore: any;
} & QueryResponse;

export interface ICustomer {
  state?: 'visitor' | 'lead' | 'customer';

  scopeBrandIds?: string[];
  firstName?: string;
  lastName?: string;
  middleName?: string;
  birthDate?: Date;
  sex?: number;
  primaryEmail?: string;
  emails?: string[];
  avatar?: string;
  primaryPhone?: string;
  phones?: string[];

  ownerId?: string;
  position?: string;
  department?: string;
  leadStatus?: string;
  hasAuthority?: string;
  description?: string;
  doNotDisturb?: string;
  isSubscribed?: string;
  emailValidationStatus?: string;
  phoneValidationStatus?: string;
  links?: any;
  relatedIntegrationIds?: string[];
  integrationId?: string;
  tagIds?: string[];

  // TODO migrate after remove 1row
  companyIds?: string[];

  mergedIds?: string[];
  status?: string;
  customFieldsData?: any;
  trackedData?: any;
  location?: any;
  visitorContactInfo?: any;
  deviceTokens?: string[];
  code?: string;
  isOnline?: boolean;
  lastSeenAt?: Date;
  sessionCount?: number;
  visitorId?: string;

  _id: string;
  profileScore?: number;
  score?: number;
  createdAt: Date;
  modifiedAt: Date;
  searchText?: string;
}

export interface IAttachment {
  url: string;
  name: string;
  type: string;
  size: number;
}

export interface IPutResponse {
  createdAt: Date;
  contentType: string;
  contentId: string;
  success: string;
  billId: string;
  date: string;
  macAddress: string;
  internalCode: string;
  billType: string;
  lotteryWarningMsg: string;
  errorCode: string;
  message: string;
  getInformation: string;
  taxType: string;
  qrData: string;
  lottery: string;
  sendInfo: object;
  stocks: object;
  amount: string;
  vat: string;
  cityTax: string;
  returnBillId: string;
  cashAmount: string;
  nonCashAmount: string;
  registerNumber: string;
  customerName: string;
}

export interface ICustomerParams {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  sex?: number;
}

export interface IInvoiceParams {
  orderId: string;
  amount?: number;
}

export interface IInvoiceCheckParams {
  orderId: string;
  _id: string;
}

export interface IPaymentParams {
  cardAmount?: number;
  cashAmount?: number;
  mobileAmount?: number;
  billType: string;
  registerNumber?: string;
}
