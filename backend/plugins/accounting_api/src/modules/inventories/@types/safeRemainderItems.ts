import { Document } from 'mongoose';

export interface ISafeRemainderItem {
  remainderId: string;
  productId: string;

  preCount: number;
  count: number;
  status: string;
  order: number;

  description: string;

  trInfo: {
    unitCost?: number;
    isSale?: boolean;
    salePrice?: number;
  };
}

export interface ISafeRemainderItemDocument
  extends ISafeRemainderItem, Document {
  _id: string;
  modifiedAt: Date;
  modifiedBy: string;
}
