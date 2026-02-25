export interface IPermissionAction {
  title: string;
  name: string;
  description: string;
  always?: boolean;
  disabled?: boolean;
  type?: 'resolver' | 'custom';
}

export interface IPermissionScope {
  name: 'own' | 'group' | 'all';
  description: string;
}

export interface IPermissionModule {
  name: string;
  description?: string;
  scopes: IPermissionScope[];
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
  description: string;
  permissions: IPermissionGroupPermission[];
}

export interface IPermissionConfig {
  plugin: string;
  modules: IPermissionModule[];

  defaultGroups?: IDefaultPermissionGroup[];
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
