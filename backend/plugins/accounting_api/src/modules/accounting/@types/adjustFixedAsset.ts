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

export const DEFERRED_TAX_TYPES = {
  ASSET: 'asset',
  LIABILITY: 'liability',
  ALL: ['asset', 'liability'],
};

export interface IAdjustFxaDetail {
  adjustId: string;
  fxaInstanceId: string;
  fixedAssetId?: string;
  categoryId?: string;
  accountId?: string;
  branchId?: string;
  departmentId?: string;

  originalCost: number;
  salvageValue?: number;
  openingBookValue?: number;
  openingAccumulatedDepreciation?: number;
  depreciationAmount?: number;
  bookDepreciationAmount?: number;
  closingAccumulatedDepreciation?: number;
  closingBookValue?: number;

  openingTaxBase?: number;
  openingTaxAccumulatedDepreciation?: number;
  taxDepreciationAmount?: number;
  closingTaxAccumulatedDepreciation?: number;
  closingTaxBase?: number;

  openingTemporaryDifference?: number;
  temporaryDifferenceAmount?: number;
  closingTemporaryDifference?: number;
  deferredTaxAmount?: number;
  deferredTaxType?: string;
  deferredTaxTransactionId?: string;
  deferredTaxTrDetailId?: string;

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

export interface IAdjustFixedAssetDocument
  extends IAdjustFixedAsset,
    Document {
  _id: string;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  modifiedBy?: string;
}
