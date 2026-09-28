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
  isCostExplicit?: boolean;
  lastIncomePrice?: number;
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
  cost?: number;
  status: string;
  order: number;

  description: string;

  trInfo?: ISafeRemainderItemTrInfo;
}

export interface ISafeRemainderItemDocument
  extends ISafeRemainderItem, Document {
  _id: string;
  createdAt: Date;
  createdBy: string;
  modifiedAt: Date;
  modifiedBy: string;
}
