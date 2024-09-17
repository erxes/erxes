import { Document, Schema } from 'mongoose';
import { field } from './utils';

const ACCOUNT_PERM_LEVELS = {
  READ: 'read',
  CREATE: 'create',
  SELF_UPDATE: 'selfUp',
  SELF_DELETE: 'selfDel',
  UPDATE: 'update',
  DELETE: 'delete',
  ALL: [
    'read',
    'create',
    'selfUpdate',
    'selfDelete',
    'update',
    'delete'
  ]
}

export interface IPermission {
  userId: string;
  accountId: string;
  permission: string;
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
  userId: field({ type: String, index: true, label: 'User' }),
  accountId: field({ type: String, index: true, label: 'Account' }),
  permission: field({
    type: String,
    label: 'Permission',
    enum: ACCOUNT_PERM_LEVELS.ALL,
    default: ACCOUNT_PERM_LEVELS.READ
  }),
  createdAt: field({ type: Date }),
  modifiedAt: field({ type: Date })
});
