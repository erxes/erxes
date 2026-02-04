export interface IPermissionAction {
  name: string;
  description: string;
  always?: boolean;
  disabled?: boolean;
  type?: 'resolver' | 'custom';
}

export interface IPermissionModule {
  name: string;
  description?: string;
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
  description: string;
  permissions: IPermissionGroupPermission[];
}

export interface IPermissionConfig {
  plugin: string;
  scopes?: {
    own: string;
    group: string;
    all: string;
  };
  modules: IPermissionModule[];
  defaultGroups: IDefaultPermissionGroup[];
}

export interface IPermissionGroup {
  name: string;
  description?: string;
  permissions: IPermissionGroupPermission[];
}

export interface IPermissionGroupDocument extends IPermissionGroup, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface IPermissionInput {
  module: string;
  actions: string[];
  scope: 'own' | 'group' | 'all';
}
