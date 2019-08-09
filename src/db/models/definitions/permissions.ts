import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IPermission {
  module?: string;
  action: string;
  userId?: string;
  groupId?: string;
  requiredActions: string[];
  allowed: boolean;
}

export interface IPermissionParams {
  module?: string;
  actions?: string[];
  userIds?: string[];
  groupIds?: string[];
  requiredActions?: string[];
  allowed?: boolean;
}

export interface IPermissionDocument extends IPermission, Document {
  _id: string;
}

export const permissionSchema = new Schema({
  _id: field({ pkey: true }),
  module: field({ type: String }),
  action: field({ type: String }),
  userId: field({ type: String }),
  groupId: field({ type: String }),
  requiredActions: field({ type: [String], default: [] }),
  allowed: field({ type: Boolean, default: false }),
});

export interface IUserGroup {
  name?: string;
  description?: string;
}

export interface IUserGroupDocument extends IUserGroup, Document {
  _id: string;
}

export const userGroupSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, unique: true }),
  description: field({ type: String }),
});
