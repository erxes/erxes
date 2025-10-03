import { Document } from 'mongoose';

export interface IAccount {
  code: string;
  name: string;
  categoryId?: string;
  parentId?: string;
  currency: string;
  kind: string;
  journal: string;
  description?: string;
  branchId?: string;
  departmentId?: string;
  scopeBrandIds?: string[];
  status: string;
  isTemp?: boolean;
  isOutBalance: boolean;
  mergedIds?: string[];
}

export interface IAccountDocument extends IAccount, Document {
  _id: string;
  createdAt: Date;
}

export interface IAccountsEdit extends IAccount {
  _id: string;
}
