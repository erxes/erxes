import { Document, Schema } from 'mongoose';

export type LdapServerType = 'activeDirectory' | 'openLdap';

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
}

export interface ILdapConfigDocument extends ILdapConfig, Document {
  // Sealed with sealSecret; never returned through the API
  bindPassword?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthIdentityDocument extends Document {
  userId: string;
  provider: 'ldap';
  // Stable directory id: AD objectGUID or OpenLDAP entryUUID, survives renames
  subject: string;
  dn: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

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
      enum: ['ldap'],
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
