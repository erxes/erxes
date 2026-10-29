export type TLdapServerType = 'activeDirectory' | 'openLdap';

export interface ILdapGroupMapping {
  groupDn: string;
  permissionGroupIds: string[];
}

export interface ILdapConfig {
  enabled: boolean;
  serverType: TLdapServerType;
  url?: string;
  startTls: boolean;
  bindDn?: string;
  hasBindPassword: boolean;
  baseDn?: string;
  loginAttribute?: string;
  userFilter?: string;
  allowedGroupDns: string[];
  linkEmailDomains: string[];
  groupMappings: ILdapGroupMapping[];
  updatedAt?: string;
}

export interface ILdapProfile {
  dn: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  groupDns: string[];
}

export interface ILdapTestResult {
  ok: boolean;
  message: string;
  profile?: ILdapProfile | null;
}

export interface ILdapConfigInput {
  enabled: boolean;
  serverType: TLdapServerType;
  url: string;
  startTls: boolean;
  bindDn: string;
  bindPassword?: string;
  baseDn: string;
  loginAttribute: string;
  userFilter?: string;
  allowedGroupDns: string[];
  linkEmailDomains: string[];
  groupMappings: ILdapGroupMapping[];
}

export const LDAP_SERVER_DEFAULTS: Record<
  TLdapServerType,
  { loginAttribute: string; userFilter: string }
> = {
  activeDirectory: {
    loginAttribute: 'sAMAccountName',
    userFilter: '(&(objectCategory=person)(objectClass=user))',
  },
  openLdap: {
    loginAttribute: 'uid',
    userFilter: '(objectClass=inetOrgPerson)',
  },
};
