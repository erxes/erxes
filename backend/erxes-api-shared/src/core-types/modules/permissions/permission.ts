import { Document } from 'mongoose';
import { IUser } from '../team-member/user';
export interface IPermission {
  module: string;
  action: string;
  userId?: string;
  groupId?: string;
  requiredActions: string[];
  allowed: boolean;
}

export interface IPermissionDocument extends IPermission, Document {
  _id: string;
}

export interface IPermissionParams {
  module: string;
  actions: string[];
  userIds?: string[];
  groupIds?: string[];
  allowed: boolean;
}

export interface IUserGroup {
  name?: string;
  description?: string;
  branchIds?: string[];
  departmentIds?: string[];
}

export interface IUserGroupDocument extends IUserGroup, Document {
  _id: string;
}
export interface IActionMap {
  [key: string]: boolean;
}

export interface IActionsMap {
  name?: string;
  module?: string;
  description?: string;
  use?: string[];
}
export interface IPermissionParams {
  module: string;
  actions: string[];
  userIds?: string[];
  groupIds?: string[];
  allowed: boolean;
}

export interface IModuleMap {
  name: string;
  description?: string;
  actions?: IActionsMap[];
}

export interface IPermissionContext {
  user?: IUser;
  [x: string]: any;
}
