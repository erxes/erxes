import { Document } from 'mongoose';

export interface ISafeRemainderItem {
  branchId: string;
  departmentId: string;
  remainderId: string;
  productId: string;

  preCount: number;
  count: number;
  status: string;
  order: number;
}

export interface ISafeRemainderItemDocument
  extends ISafeRemainderItem, Document {
  _id: string;
  modifiedAt: Date;
  modifiedBy: string;
}
