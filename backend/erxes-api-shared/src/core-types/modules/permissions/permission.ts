export interface PermissionAction {
  name: string;
  description: string;
  always?: boolean;
  disabled?: boolean;
}

export interface PermissionModule {
  name: string;
  description?: string;
  scopeField?: string | null;
  ownerFields?: string[];
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
  scopes?: {
    own: string;
    group: string;
    all: string;
  };
  modules: PermissionModule[];
  defaultGroups: DefaultPermissionGroup[];
}
