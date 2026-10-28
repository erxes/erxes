export interface IPermissionAction {
  title: string;
  name: string;
  description: string;
  oauthScope?: string;
  oauthScopes?: string[];
  always?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  type?: 'resolver' | 'custom';
}

export interface IPermissionScope {
  name: string;
  description: string;
}

export interface IPermissionModule {
  name: string;
  description?: string;
  scopes: IPermissionScope[];
  scopeField?: string | null;
  ownerFields?: string[];
  scopeCollections?: string[];
  entityField?: string;
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
  plugin?: string;
  templateId?: string;
  permissions: IPermissionGroupPermission[];
}

export interface IEffectivePermissionGrant {
  permissions: IPermissionGroupPermission[];
  entityId: string;
  inherit: boolean;
}

export interface IPermissionGroupDocument extends IPermissionGroup, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface IPermissionInput {
  module: string;
  actions: string[];
  scope: string;
}
