import { Document } from 'mongoose';

export const ACCOUNT_PERMISSION_SCOPES = {
  NONE: 'none',
  OWN: 'own',
  LT_LVL: 'ltLvl',
  LTE_LVL: 'lteLvl',
  GT_LVL: 'gtLvl',
  ALL: ['none', 'own', 'ltLvl', 'lteLvl', 'gtLvl'],
  RATE: {
    none: 0,
    own: 1,
    ltLvl: 2,
    lteLvl: 3,
    gtLvl: 4,
  },
};

export const ACCOUNT_PERMISSION_WRITE_SCOPES = {
  NONE: 'none',
  ADD: 'add',
  OWN: 'own',
  LT_LVL: 'ltLvl',
  LTE_LVL: 'lteLvl',
  GT_LVL: 'gtLvl',
  ALL: ['none', 'add', 'own', 'ltLvl', 'lteLvl', 'gtLvl'],
  RATE: {
    none: 0,
    add: 1,
    own: 1,
    ltLvl: 2,
    lteLvl: 3,
    gtLvl: 4,
  },
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
