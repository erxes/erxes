import { Document } from 'mongoose';

export const ACCOUNT_PERMISSION_SCOPES = {
  NONE: 'none',
  OWN: 'own',
  LT_LVL: 'ltLvl',
  LTE_LVL: 'lteLvl',
  GT_LVL: 'gtLvl',
  ALL: ['none', 'own', 'ltLvl', 'lteLvl', 'gtLvl'],
};

export const ACCOUNT_PERMISSION_WRITE_SCOPES = {
  NONE: 'none',
  ADD: 'add',
  OWN: 'own',
  LT_LVL: 'ltLvl',
  LTE_LVL: 'lteLvl',
  GT_LVL: 'gtLvl',
  ALL: ['none', 'add', 'own', 'ltLvl', 'lteLvl', 'gtLvl'],
};

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