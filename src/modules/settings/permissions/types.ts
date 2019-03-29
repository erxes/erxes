import { IUser } from 'modules/auth/types';
import { IUserGroup } from '../usersGroups/types';

export interface IPermission {
  module: string;
  action: string;
  userId: string;
  groupId: string;
  requiredActions: string[];
  allowed: boolean;
}

export interface IPermissionDocument extends IPermission {
  _id: string;
  user: IUser;
  group: IUserGroup;
}

export interface IModule {
  name: string;
  description?: string;
  actions?: IActions[];
}

export interface IActions {
  name?: string;
  module?: string;
  description?: string;
  use?: string[];
}

export interface IPermissionParams {
  module?: string;
  actions?: string[];
  userIds?: string[];
  groupIds?: string[];
  requiredActions?: string[];
  allowed?: boolean;
}

export type PermissionTotalCountQueryResponse = {
  permissionsTotalCount: number;
  refetch: () => void;
  loading: boolean;
};

export type PermissionsQueryResponse = {
  permissions: IPermissionDocument[];
  refetch: () => void;
  loading: boolean;
};

export type PermissionModulesQueryResponse = {
  permissionModules: IModule[];
  loading: boolean;
};

export type PermissionActionsQueryResponse = {
  permissionActions: IActions[];
  loading: boolean;
};

export type PermissionAddMutationResponse = {
  addMutation: (params: { variables: IPermissionParams }) => void;
};

export type PermissionRemoveMutationResponse = {
  removeMutation: (params: { variables: { ids: string[] } }) => void;
};
