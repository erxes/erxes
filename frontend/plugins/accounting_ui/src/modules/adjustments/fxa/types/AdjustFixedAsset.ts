import { IAccount } from '@/settings/account/types/Account';
import { IFixedAsset } from '@/settings/fixed-assets/types/FixedAsset';
import { IBranch, IDepartment } from 'ui-modules';

export interface IAdjustFixedAsset {
  _id: string;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  modifiedBy?: string;
  date: Date;
  description?: string;
  status: string;
  error?: string;
  warning?: string;
  beginDate?: Date;
  successDate?: Date;
  checkedAt?: Date;
}

export interface IAdjustFxaDetail {
  _id: string;
  adjustId: string;
  fxaInstanceId: string;
  fixedAssetId?: string;
  categoryId?: string;
  accountId?: string;
  branchId?: string;
  departmentId?: string;
  originalCost?: number;
  salvageValue?: number;
  openingBookValue?: number;
  openingAccumulatedDepreciation?: number;
  depreciationAmount?: number;
  bookDepreciationAmount?: number;
  closingAccumulatedDepreciation?: number;
  closingBookValue?: number;
  transactionId?: string;
  transactionDetailId?: string;
  error?: string;
  warning?: string;
  account?: IAccount;
  fixedAsset?: Pick<IFixedAsset, '_id' | 'code' | 'name'>;
  branch?: IBranch;
  department?: IDepartment;
}

export const ADJ_FXA_STATUSES = {
  DRAFT: 'draft',
  RUNNING: 'running',
  PROCESS: 'process',
  COMPLETE: 'complete',
  PUBLISH: 'publish',
  ALL: ['draft', 'publish', 'running', 'process', 'complete'],
};
