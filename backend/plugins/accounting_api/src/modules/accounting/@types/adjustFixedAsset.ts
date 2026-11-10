import { Document } from 'mongoose';
import { ICommonAdjusting } from './commonAdjusting';

export const ADJ_FXA_STATUSES = {
  DRAFT: 'draft',
  RUNNING: 'running',
  PROCESS: 'process',
  COMPLETE: 'complete',
  PUBLISH: 'publish',
  ALL: ['draft', 'publish', 'running', 'process', 'complete'],
};

export interface IAdjustFxaDetail {
  adjustId: string;
  fixedAssetId?: string;
  categoryId?: string;
  accountId?: string;
  branchId?: string;
  departmentId?: string;

  count?: number;
  originalCost: number;
  salvageValue?: number;
  accumulatedDepreciation?: number;
  depreciationAmount?: number;
  revaluationLoss?: number;
  revaluationReserve?: number;

  transactionId?: string;
  transactionDetailId?: string;
  error?: string;
  warning?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAdjustFxaDetailDocument extends IAdjustFxaDetail, Document {
  _id: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IAdjustFixedAsset extends ICommonAdjusting {
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

export interface IAdjustFixedAssetDocument extends IAdjustFixedAsset, Document {
  _id: string;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  modifiedBy?: string;
}
