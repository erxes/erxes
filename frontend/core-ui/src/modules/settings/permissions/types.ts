// types/permissions.ts

export interface IPermissionAction {
  name: string;
  description: string;
  always?: boolean;
  disabled?: boolean;
}

export interface IPermissionModule {
  name: string;
  description?: string;
  plugin: string;
  scopeField?: string | null;
  ownerFields?: string[];
  actions: IPermissionAction[];
}

export interface IPermissionGroupPermission {
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

// For groupedByPlugin
export interface IGroupedByPlugin {
  [plugin: string]: IDefaultPermissionGroup[];
}
