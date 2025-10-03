import { Document } from 'mongoose';
import { ICommonAdjusting } from './commonAdjusting';

export interface ICommonAdjInvDetail {
  remainder: number;
  cost: number;
  unitCost: number;
  soonInCount?: number;
  soonOutCount?: number;
}
export interface ICommonAdjInvDetailInfo extends ICommonAdjInvDetail {
  _id?: string;
  date: Date;
}

export interface IAdjustInvDetailParams {
  productId: string;
  accountId: string;
  departmentId: string;
  branchId: string;
}

export interface IAdjustInvDetailParamsId extends IAdjustInvDetailParams {
  adjustId: string;
}

export interface IAdjustInvDetail extends IAdjustInvDetailParamsId, ICommonAdjInvDetail {
  error?: string;
  warning?: string;
  infoPerDate?: ICommonAdjInvDetailInfo[];
}

export interface IAdjustInvDetailDocument extends IAdjustInvDetail, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdjustInventory extends ICommonAdjusting {
  date: Date;
  description: string;
  status: string;
  error?: string;
  warning?: string;
  beginDate?: Date;
  successDate?: Date;
  checkedAt?: Date;

  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  modifiedBy?: string;
}

export interface IAdjustInventoryDocument extends IAdjustInventory, Document {
  _id: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  modifiedBy: string;
}

export const ADJ_INV_STATUSES = {
  DRAFT: 'draft',
  RUNNING: 'running',
  PROCESS: 'process',
  COMPLETE: 'complete',
  PUBLISH: 'publish',
  all: ['draft', 'publish', 'running', 'process', 'complete'],
};
