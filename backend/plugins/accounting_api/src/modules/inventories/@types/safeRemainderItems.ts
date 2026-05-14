import { Document } from 'mongoose';

export interface IRemainderParams {
  departmentId?: string;
  branchId?: string;
  productId: string;
  uom?: string;
}

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
    unitPrice?: number;
  };
}

export interface ISafeRemainderItemDocument
  extends ISafeRemainderItem, Document {
  _id: string;
  modifiedAt: Date;
  modifiedBy: string;
}
