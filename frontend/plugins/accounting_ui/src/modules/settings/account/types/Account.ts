import { IAccountCategory } from '../account-categories/types/AccountCategory';

export interface IAccount {
  _id: string;
  createdAt: Date;
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
  isTemp: boolean;
  isOutBalance: boolean;
  mergedIds?: string[];
  extra?: {
    bank?: BankEnum;
    bankAccount?: string;
  };
  category?: IAccountCategory;
}

export enum AccountKind {
  ACTIVE = 'active',
  PASSIVE = 'passive',
}

export enum AccountStatus {
  ACTIVE = 'active',
  DELETED = 'deleted',
}

export enum JournalEnum {
  MAIN = 'main',
  TAX = 'tax',
  CASH = 'cash',
  BANK = 'bank',
  DEBT = 'debt',
  EXCHANGE_DIFF = 'exchangeDiff',
  INVENTORY = 'inventory',
  INV_FOLLOW = 'invFollow',
  FIXED_ASSET = 'fixedAsset',
}
export enum BankEnum {
  XAC = 'xac',
  GOLOMT = 'golomt',
  KHAN = 'khan',
  TDB = 'tdb',
}
