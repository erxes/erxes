import { IAttachment } from 'erxes-ui';

export interface IReceiptItem {
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

export interface IReceipt {
  _id: string;
  id: string;
  totalAmount: number;
  totalVAT: number;
  totalCityTax: number;
  taxType: string;
  merchantTin: string;
  items: IReceiptItem[];
  scopeBrandIds: string[];
}

export interface IPutResponse {
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
  receipts: IReceipt[];
  payments: any[];
  easy: boolean;
  getInformation: any;
  sendInfo: Record<string, any>;
  state: string | null;
  createdAt: string;
  modifiedAt: string;
  userId: string | null;
  user: {
    id: string;
    posId: number;
    status: string;
    message: string;
    qrData: string | null;
    lottery: string | null;
    date: string;
    __typename?: string;
  } | null;
  id: string;
  posId: number;
  status: string;
  message: string;
  qrData: string | null;
  lottery: string | null;
  date: string;
  __typename?: string;
}

export interface IPutResponseCategory {
  _id: string;
  name: string;
  avatar: IAttachment;
  code: string;
  order: string;
  productCount: number;
  parentId: string;
}
