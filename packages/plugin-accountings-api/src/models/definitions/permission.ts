import { Document, Schema } from 'mongoose';
import { field } from './utils';

const ACCOUNT_PERM_LEVELS = {
  READ: 'read', ALL: [
    'read',
    'create',
    'meUpdate',
    'meDel',
    'update',
    'delete'
  ]
}

export interface IPermission {
  userGroupId: string;
  userId: string;
  accountsFilter: any;
}

export interface IPermissionDocument
  extends IPermission,
  Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
}

// Mongoose schemas ===========

export const permissionSchema = new Schema({
  _id: field({ pkey: true }),
  date: field({ type: Date }),
  mainCurrency: field({ type: String }),
  rateCurrency: field({ type: String }),
  rate: field({ type: Number }),
  createdAt: field({ type: Date }),
  modifiedAt: field({ type: Date })
});
