import { IAttachment } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';

export interface IOrderItem {
  createdAt?: Date;
  productId: string;
  count: number;
  unitPrice: number;
  discountAmount?: number;
  discountPercent?: number;
  bonusCount?: number;
  bonusVoucherId?: string;
  orderId?: string;
  isPackage?: boolean;
  isTake?: boolean;
  status?: string;
  manufacturedDate?: string;
  description?: string;
  attachment?: IAttachment;
  closeDate?: Date;
  couponCode?: string;
}

export interface IOrderItemDocument extends Document, IOrderItem {
  _id: string;
  productName?: string;
  byDevice?: { [deviceId: string]: number };
}
