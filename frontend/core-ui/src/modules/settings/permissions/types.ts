// types/permissions.ts

export interface IPermissionAction {
  title: string;
  name: string;
  description: string;
  always?: boolean;
  disabled?: boolean;
}

export interface IPermissionScope {
  name: string;
  description: string;
}

export interface IPermissionModule {
  name: string;
  description?: string;
  scopes?: IPermissionScope[] | null;
  plugin: string;
  scopeField?: string | null;
  ownerFields?: string[];
  actions: IPermissionAction[];
  always?: boolean;
}

export interface IPermissionGroupPermission {
  plugin: string;
  module: string;
  actions: string[];
  scope: string;
}

export interface IDefaultPermissionGroup {
  id: string;
  name: string;
  description?: string;
  plugin: string;
  permissions: IPermissionGroupPermission[];
  members?: IPermissionGroupMember[];
}

export interface IPermissionGroupMember {
  _id: string;
  email: string;
  isActive?: boolean;
  details?: {
    fullName?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}

export interface IPermissionGroup {
  _id: string;
  name: string;
  description?: string;
  plugin?: string;
  templateId?: string;
  permissions: IPermissionGroupPermission[];
  members?: IPermissionGroupMember[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Permission modules grouped by plugin (API response)
export interface IPermissionModulesByPlugin {
  plugin: string;
  modules: IPermissionModule[];
}
