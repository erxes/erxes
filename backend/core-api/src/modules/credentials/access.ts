import { CredentialsError } from './types';
import { validTenant } from './tokens';

export type CredentialPermission = 'credentialsRead' | 'credentialsManage' | 'credentialGrantsManage';
export interface CredentialPermissionEntry {
  plugin?: string;
  module: string;
  actions: string[];
  scope: string;
}
export interface CredentialPrincipal {
  _id: string;
  isActive?: boolean;
  isOwner?: boolean;
  appId?: string;
  permissionGroupIds?: string[];
  customPermissions?: CredentialPermissionEntry[];
}
export interface CredentialAccessDependencies {
  verifySession(token: string): Promise<string>;
  sessionIsActive(userId: string, token: string): Promise<boolean>;
  findUser(userId: string): Promise<CredentialPrincipal | null>;
  groupPermissions(ids: string[]): Promise<CredentialPermissionEntry[]>;
}

export const authorizeCredentialManagement = async (
  tenant: string,
  token: string,
  action: CredentialPermission,
  dependencies: CredentialAccessDependencies,
): Promise<CredentialPrincipal> => {
  const denied = () => new CredentialsError('CREDENTIALS_FORBIDDEN');
  if (!validTenant(tenant) || !token || token.length > 8192) throw denied();
  const userId = await dependencies.verifySession(token);
  if (!userId || !await dependencies.sessionIsActive(userId, token)) throw denied();
  const user = await dependencies.findUser(userId);
  if (!user || user._id !== userId || user.isActive !== true || user.appId) throw denied();
  if (user.isOwner === true) return user;
  const entries = [...(user.customPermissions || []),
    ...await dependencies.groupPermissions(user.permissionGroupIds || [])];
  if (!entries.some((entry) => entry.plugin === 'core' && entry.module === 'credentials' &&
      entry.scope === 'all' && (entry.actions.includes(action) || entry.actions.includes('*')))) {
    throw denied();
  }
  return user;
};
