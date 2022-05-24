import * as express from 'express';
// import { IConfigDocument } from './../models/definitions/configs';
// import { IPosUserDocument } from './db/models/definitions/posUsers';
// import { IUserDocument } from './db/models/definitions';

export interface IContext {
  res: express.Response;
  requestInfo: any;
  // user: IUserDocument;
  // posUser: IPosUserDocument;
  // config: IConfigDocument;
}

export interface ILoginParams {
  type?: string;
  email: string;
  password: string;
  deviceToken?: string;
  description?: string;
}

export interface IPosLoginParams {
  type?: string;
  email: string;
  password: string;
  description?: string;
}

export interface IOrderItemInput {
  _id: string;
  productId: string;
  count: number;
  unitPrice: number;
  isPackage?: boolean;
  isTake?: boolean;
}

export interface IOrderInput {
  items: IOrderItemInput[];
  totalAmount: number;
  type: string;
  customerId?: string;
  branchId?: string;
  deliveryInfo?: any;
  origin?: string;
}
