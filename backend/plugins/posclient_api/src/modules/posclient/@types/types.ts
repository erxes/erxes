import { IUserDocument, IAttachment } from 'erxes-api-shared/core-types';
import * as express from 'express';
import { IModels } from '~/connectionResolvers';
import { IConfigDocument } from '~/modules/posclient/@types/configs';
import { IPosUserDocument } from '~/modules/posclient/@types/posUsers';

export interface IContext {
  res: express.Response;
  requestInfo: any;
  user: IUserDocument;
  posUser?: IPosUserDocument;
  config: IConfigDocument;
  models: IModels;
  subdomain: string;
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
  unitPrice?: number;
  isPackage?: boolean;
  isTake?: boolean;
  status?: string;
  discountPercent?: number;
  discountAmount?: number;
  bonusCount?: number;
  bonusVoucherId?: string;
  manufacturedDate?: string; // Unix epoch number
  description?: string;
  attachment?: IAttachment;
  closeDate?: Date;
  byDevice?: { [deviceToken: string]: number };
}

export interface IOrderInput {
  items: IOrderItemInput[];
  totalAmount: number;
  directDiscount?: number;
  directIsAmount?: boolean;
  type: string;
  customerId?: string;
  customerType?: string;
  branchId?: string;
  deliveryInfo?: any;
  origin?: string;
  slotCode?: string;
  dueDate?: Date;
  description: string;
  isPre?: boolean;
  buttonType?: string;
  closeDate?: Date;
  subscriptionId?: string;
  isSingle?: boolean;
  deviceId?: string;
  couponCode?: string;
  voucherId?: string;
}
