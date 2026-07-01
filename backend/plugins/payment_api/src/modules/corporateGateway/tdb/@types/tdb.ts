import { Document } from 'mongoose';

export interface ITdbConfig {
  name: string;
  description?: string;

  // TDB E-Commerce credentials
  apiUrl: string;
  username: string;
  password: string;
  testMode?: boolean;
}

export interface ITdbConfigDocument extends ITdbConfig, Document {
  _id: string;
  createdAt: Date;
}

// Order types
export interface TdbOrderInput {
  typeRid?: string; // default 'purch'
  amount: number;
  currency: string;
  description: string;
  language?: string; // 'en' or 'mn'
  hppRedirectUrl: string;
}

export interface TdbOrderCreateResponse {
  order: {
    id: number;
    password: string;
    hppUrl: string;
    typeRid: string;
    amount: number;
    currency: string;
    description: string;
    language: string;
    hppRedirectUrl: string;
  };
}

export interface TdbOrderDetail {
  order: {
    id: number;
    typeRid: string;
    status: string;
    prevStatus: string;
    lastStatusLogin: string;
    amount: number;
    currency: string;
    createTime: string;
    type: {
      title: string;
    };
  };
}

export interface TdbOrderStatusResponse {
  orderId: number;
  status: string;
  amount: number;
  currency: string;
  createTime: string;
  isSuccessful: boolean;
}

export type TdbOrderStatus =
  | 'PREPARING'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'REFUSED'
  | 'CLOSED'
  | 'VOIDED'
  | 'REFUNDED'
  | 'DECLINED'
  | 'FULLYPAID'
  | 'PARTPAID'
  | 'AUTHORIZED'
  | 'PAID';

export const SUCCESSFUL_STATUSES: TdbOrderStatus[] = [
  'FULLYPAID',
  'PARTPAID',
  'AUTHORIZED',
  'PAID',
];

export interface ITdbOrder {
  orderId: number;
  password: string;
  hppUrl?: string;
  amount: number;
  currency: string;
  description: string;
  language?: string;
  status: TdbOrderStatus;
  createTime: string;
  typeRid?: string;
  hppRedirectUrl?: string;
  paymentId?: string;
  invoiceId?: string;
}

export interface ITdbOrderDocument extends ITdbOrder, Document {
  _id: string;
  createdAt: Date;
}