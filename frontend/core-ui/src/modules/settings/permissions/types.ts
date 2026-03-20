// types/permissions.ts

export interface IPermissionAction {
  title: string;
  name: string;
  description: string;
  always?: boolean;
  disabled?: boolean;
}

export interface IPermissionModule {
  name: string;
  description?: string;
  scopes: {
    name: string;
    description: string;
  }[];
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
  scope: 'own' | 'group' | 'all';
}

export interface IDefaultPermissionGroup {
  id: string;
  name: string;
  description?: string;
  plugin: string;
  permissions: IPermissionGroupPermission[];
}

export interface IPermissionGroup {
  _id: string;
  name: string;
  description?: string;
  permissions: IPermissionGroupPermission[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Permission modules grouped by plugin (API response)
export interface IPermissionModulesByPlugin {
  plugin: string;
  modules: IPermissionModule[];
}

// For groupedByPlugin
export interface IGroupedByPlugin {
  [plugin: string]: IDefaultPermissionGroup[];
}
