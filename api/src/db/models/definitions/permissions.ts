import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IPermission {
  module: string;
  action: string;
  userId?: string;
  groupId?: string;
  requiredActions: string[];
  allowed: boolean;
}

export interface IPermissionParams {
  module: string;
  actions: string[];
  userIds?: string[];
  groupIds?: string[];
  allowed: boolean;
}

export interface IPermissionDocument extends IPermission, Document {
  _id: string;
}

export const permissionSchema = new Schema({
  _id: field({ pkey: true }),
  module: field({ type: String, label: 'Module' }),
  action: field({ type: String, label: 'Action' }),
  userId: field({ type: String, label: 'User' }),
  groupId: field({ type: String, label: 'User group' }),
  requiredActions: field({
    type: [String],
    default: [],
    label: 'Required actions'
  }),
  allowed: field({ type: Boolean, default: false, label: 'Allowed' })
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
  name: field({ type: String, unique: true, label: 'Name' }),
  description: field({ type: String, label: 'Description' })
});
