import { IAccount } from '@/settings/account/types/Account';
import { IBranch, IDepartment, IProduct } from 'ui-modules';

export interface IAdjustInventory {
  _id: string;
  createdAt: Date | string;
  createdBy: string;
  updatedAt: Date | string;
  modifiedBy: string;

  date: Date | string;
  description: string;
  status: string;
  error?: string;
  warning?: string;
  beginDate?: Date | string;
  successDate?: Date | string;
  checkedAt?: Date | string;
}

export interface IAdjustInvDetail {
  _id: string;
  adjustId: string;
  productId: string;
  accountId: string;
  departmentId: string;
  branchId: string;

  createdAt: Date;
  updatedAt: Date;

  remainder: number;
  cost: number;
  unitCost: number;
  soonInCount?: number;
  soonOutCount?: number;

  error?: string;
  warning?: string;
  byDate?: any;

  product?: IProduct;
  account?: IAccount;
  branch?: IBranch;
  department?: IDepartment;
}

export const ADJ_INV_STATUSES = {
  DRAFT: 'draft',
  RUNNING: 'running',
  PROCESS: 'process',
  COMPLETE: 'complete',
  PUBLISH: 'publish',
  all: ['draft', 'publish', 'running', 'process', 'complete'],
};
