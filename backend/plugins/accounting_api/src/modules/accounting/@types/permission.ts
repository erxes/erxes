import { Document } from 'mongoose';

export const ACCOUNT_PERMISSION_SCOPES = {
  NONE: 'none',
  OWN: 'own',
  LT_LVL: 'ltLvl',
  LTE_LVL: 'lteLvl',
  GT_LVL: 'gtLvl',
  VALUES: ['own', 'ltLvl', 'lteLvl', 'gtLvl'],
} as const;

export const ACCOUNT_PERMISSION_WRITE_SCOPES = {
  NONE: 'none',
  ADD: 'add',
  OWN: 'own',
  LT_LVL: 'ltLvl',
  LTE_LVL: 'lteLvl',
  GT_LVL: 'gtLvl',
  VALUES: ['add', 'own', 'ltLvl', 'lteLvl', 'gtLvl'],
} as const;

export interface IPermission {
  userId: string;
  accountId: string;
  level: number;
  read: string;  
  write: string;  
}

export interface IPermissionDocument extends IPermission, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}