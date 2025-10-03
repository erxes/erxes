import { Document } from 'mongoose';

export const ACCOUNT_PERM_LEVELS = {
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
  updatedAt: Date;
}
