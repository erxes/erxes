import { IAttachment } from 'erxes-ui';

export interface IUser {
  _id: string;
  email?: string;
  username?: string;
  details?: {
    avatar?: IAttachment;
    fullName?: string;
    position?: string;
  };
  isActive?: boolean;
  role?: string;
  createdAt?: string;
  modifiedAt?: string;
}

export interface IByDateItem {
  _id: string;
  name: string;
  barCode: string;
  barCodeType: string;
  classificationCode: string;
  measureUnit: string;
  qty: number;
  unitPrice: number;
  totalVAT: number;
  totalCityTax: number;
  totalAmount: number;
  scopeBrandIds: string[];
}

export interface IByDateReceipt {
  _id: string;
  id: string;
  totalAmount: number;
  totalVAT: number;
  totalCityTax: number;
  taxType: string;
  merchantTin: string;
  items: IByDateItem[];
  scopeBrandIds: string[];
}

export interface IByDate {
  _id: string;
  number: string;
  contentType: string;
  contentId: string;
  totalAmount: number;
  totalVAT: number;
  totalCityTax: number;
  districtCode: string;
  branchNo: string;
  merchantTin: string;
  posNo: string;
  customerTin: string | null;
  customerName: string | null;
  consumerNo: string | null;
  type: string;
  inactiveId: string | null;
  invoiceId: string | null;
  reportMonth: string | null;
  data: Record<string, any>;
  receipts: IByDateReceipt[];
  payments: any[];
  easy: boolean;
  getInformation: any;
  sendInfo: Record<string, any>;
  state: string | null;
  createdAt: string;
  modifiedAt: string;
  userId: string | null;
  user: IUser | null;
  id: string;
  posId: number;
  status: string;
  message: string;
  qrData: string | null;
  lottery: string | null;
  date: string;
  values?: {
    counter: number;
  };
  __typename?: string;
}

export interface IByDateCategory {
  _id: string;
  name: string;
  avatar: IAttachment;
  code: string;
  order: string;
  productCount: number;
  parentId: string;
}
