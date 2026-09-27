import { Document } from 'mongoose';

export interface IRemainderParams {
  departmentId?: string;
  branchId?: string;
  productId: string;
  uom?: string;
}

export interface ISafeRemainderItemTrInfo {
  activeCost?: number;
  unitCost?: number;
  isSale?: boolean;
  unitPrice?: number;
}

export interface ISafeRemainderImportItem {
  productCode: string;
  count: number;
  trInfo?: Omit<ISafeRemainderItemTrInfo, 'activeCost'>;
}

export interface ISafeRemainderItem {
  remainderId: string;
  productId: string;

  preCount: number;
  count: number;
  status: string;
  order: number;

  description: string;

  trInfo?: ISafeRemainderItemTrInfo;
}

export interface ISafeRemainderItemDocument
  extends ISafeRemainderItem, Document {
  _id: string;
  modifiedAt: Date;
  modifiedBy: string;
}
