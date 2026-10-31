import { Document, Schema } from 'mongoose';

export type LdapServerType = 'activeDirectory' | 'openLdap';

// What a directory change that only moves mapped permission groups does
export type LdapGroupChangePolicy = 'updatePermissions' | 'revokeSessions';

export type LdapRecheckReason =
  | 'removed'
  | 'disabled'
  | 'left_group'
  | 'permissions_changed';

export interface ILdapRecheckChange {
  userId: string;
  reason: LdapRecheckReason;
  signedOut: boolean;
  at: Date;
}

export interface ILdapRecheckRun {
  at: Date;
  status: 'ok' | 'failed';
  error?: string;
  checked: number;
}

export interface ILdapGroupMapping {
  groupDn: string;
  permissionGroupIds: string[];
}

export interface ILdapConfig {
  enabled: boolean;
  serverType: LdapServerType;
  url: string;
  startTls: boolean;
  bindDn: string;
  baseDn: string;
  loginAttribute: string;
  userFilter?: string;
  allowedGroupDns: string[];
  // Domains this directory owns: an existing account with such an email links on first login.
  // Not a login filter; other emails still provision or are linked by an admin
  linkEmailDomains: string[];
  groupMappings: ILdapGroupMapping[];
  // 0 turns the directory recheck off
  recheckEveryMinutes: number;
  groupChangePolicy: LdapGroupChangePolicy;
}

export interface ILdapConfigDocument extends ILdapConfig, Document {
  // Sealed with sealSecret; never returned through the API
  bindPassword?: string;
  lastRecheck?: ILdapRecheckRun;
  // Newest first, capped: who the recheck signed out or re-permissioned
  recheckChanges: ILdapRecheckChange[];
  createdAt: Date;
  updatedAt: Date;
}

// erxes_support: an erxes staff member let in by a support access grant
export type AuthIdentityProvider = 'ldap' | 'erxes_support';

export interface IAuthIdentityDocument extends Document {
  userId: string;
  provider: AuthIdentityProvider;
  // Stable id at the provider: AD objectGUID, OpenLDAP entryUUID or the
  // global-profile staff id; survives renames
  subject: string;
  dn?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const LDAP_RECHECK_MINUTES = [0, 5, 15, 60];

const recheckRunSchema = new Schema(
  {
    at: { type: Date, label: 'At' },
    status: { type: String, label: 'Status', enum: ['ok', 'failed'] },
    error: { type: String, label: 'Error' },
    checked: { type: Number, label: 'Checked users' },
  },
  { _id: false },
);

const recheckChangeSchema = new Schema(
  {
    userId: { type: String, label: 'User id' },
    reason: {
      type: String,
      label: 'Reason',
      enum: ['removed', 'disabled', 'left_group', 'permissions_changed'],
    },
    signedOut: { type: Boolean, label: 'Signed out' },
    at: { type: Date, label: 'At' },
  },
  { _id: false },
);

const groupMappingSchema = new Schema(
  {
    groupDn: { type: String, label: 'Group DN', required: true, trim: true },
    permissionGroupIds: {
      type: [String],
      label: 'Permission group ids',
      default: [],
    },
  },
  { _id: false },
);

export const ldapConfigSchema = new Schema(
  {
    enabled: { type: Boolean, label: 'Enabled', default: false },
    serverType: {
      type: String,
      label: 'Server type',
      enum: ['activeDirectory', 'openLdap'],
      default: 'activeDirectory',
    },
    url: { type: String, label: 'Url', trim: true },
    startTls: { type: Boolean, label: 'StartTLS', default: false },
    bindDn: { type: String, label: 'Bind DN', trim: true },
    bindPassword: { type: String, label: 'Bind password' },
    baseDn: { type: String, label: 'Base DN', trim: true },
    loginAttribute: { type: String, label: 'Login attribute', trim: true },
    userFilter: { type: String, label: 'User filter', trim: true },
    allowedGroupDns: {
      type: [String],
      label: 'Allowed group DNs',
      default: [],
    },
    linkEmailDomains: {
      type: [String],
      label: 'Link email domains',
      default: [],
    },
    groupMappings: {
      type: [groupMappingSchema],
      label: 'Group mappings',
      default: [],
    },
    recheckEveryMinutes: {
      type: Number,
      label: 'Recheck every minutes',
      enum: LDAP_RECHECK_MINUTES,
      default: 15,
    },
    groupChangePolicy: {
      type: String,
      label: 'Group change policy',
      enum: ['updatePermissions', 'revokeSessions'],
      default: 'updatePermissions',
    },
    lastRecheck: { type: recheckRunSchema, label: 'Last recheck' },
    recheckChanges: {
      type: [recheckChangeSchema],
      label: 'Recheck changes',
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export const authIdentitySchema = new Schema(
  {
    userId: { type: String, label: 'User id', required: true, index: true },
    provider: {
      type: String,
      label: 'Provider',
      enum: ['ldap', 'erxes_support'],
      required: true,
    },
    subject: { type: String, label: 'Subject', required: true },
    dn: { type: String, label: 'DN' },
    lastLoginAt: { type: Date, label: 'Last login at' },
  },
  {
    timestamps: true,
  },
);

authIdentitySchema.index({ provider: 1, subject: 1 }, { unique: true });
authIdentitySchema.index({ provider: 1, userId: 1 }, { unique: true });
