import { IUser } from 'modules/auth/types';
import { QueryResponse } from 'modules/common/types';

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
} & QueryResponse;

export type PermissionsQueryResponse = {
  permissions: IPermissionDocument[];
} & QueryResponse;

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

export interface IUserGroup {
  _id: string;
  name?: string;
  description?: string;
  memberIds?: string[];
  members?: IUser[];
}

export interface IUserGroupDocument extends IUserGroup {
  _id: string;
  objects: IUserGroup[];
}

export type UsersGroupsQueryResponse = {
  usersGroups: IUserGroup[];
  loading: boolean;
};

export type UsersGroupsTotalCountQueryResponse = {
  usersGroupsTotalCount: number;
  loading: boolean;
};

export type UsersGroupsAddMutation = {
  usersGroupsAdd: (params: { variables: IUserGroup }) => Promise<any>;
  loading: boolean;
};

export type UsersGroupsEditMutation = {
  usersGroupsEdit: (params: {
    variables: { _id: string } & IUserGroup;
  }) => Promise<any>;
};

export type UsersGroupsRemoveMutation = {
  usersGroupsRemove: (params: { variables: { _id: string } }) => Promise<any>;
};

export type UsersGroupsCopyMutation = {
  usersGroupsCopy: (params: {
    variables: { _id: string; memberIds?: string[] };
  }) => Promise<IUserGroup>;
};
