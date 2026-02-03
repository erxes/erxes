export interface PermissionAction {
  name: string;
  description: string;
  required?: boolean;
}

export interface PermissionModule {
  name: string;
  actions: PermissionAction[];
}

export interface PermissionGroupPermission {
  module: string;
  actions: string[];
  scope: 'own' | 'group' | 'all';
}

export interface DefaultPermissionGroup {
  id: string;
  name: string;
  description: string;
  permissions: PermissionGroupPermission[];
}

export interface PermissionConfig {
  plugin: string;
  modules: PermissionModule[];
  defaultGroups: DefaultPermissionGroup[];
}
