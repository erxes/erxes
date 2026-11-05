import type { Indexes } from 'erxes-sdk';
import { Connection, Model, Schema } from 'mongoose';
import type { Operations } from './graphql';
import { createGenerateModels } from 'erxes-api-shared/utils';

export interface IExtensionDocument {
  _id: string;
  subdomain: string;
  extId: string;
  version: string;
  code: string;
  // sha256 of `code`. workerd caches loaded workers under it.
  codeHash: string;
  // The version's identity. The runtime caches its GraphQL schema under it.
  buildHash: string;
  // The extension's whole GraphQL SDL, as the runtime serves it.
  typeDefs: string;
  // Query and Mutation fields the worker has resolvers for.
  resolvers: { Query?: string[]; Mutation?: string[] };
  collections: string[];
  // module -> action -> title, as the extension declared them.
  permissions: Record<string, Record<string, string>>;
  // Root field -> 'module.action' or 'public'.
  fieldPermissions: Record<string, string>;
  // sha256 -> GraphQL document: everything a run may send to erxes.
  operations: Operations;
  // Collection -> the indexes the build declared, created on activation.
  indexes: Indexes;
  // Module Federation remote name, when the extension ships a UI.
  uiRemote?: string;
  status: 'installed' | 'disabled';
  installedBy: string;
  installedAt: Date;
}

const extensionSchema = new Schema<IExtensionDocument>({
  _id: { type: String, required: true },
  subdomain: { type: String, required: true, index: true },
  extId: { type: String, required: true },
  version: { type: String, required: true },
  code: { type: String, required: true },
  codeHash: { type: String, required: true },
  buildHash: { type: String, required: true },
  typeDefs: { type: String, required: true },
  resolvers: { type: Schema.Types.Mixed, default: {} },
  collections: { type: [String], default: [] },
  permissions: { type: Schema.Types.Mixed, default: {} },
  fieldPermissions: { type: Schema.Types.Mixed, default: {} },
  operations: { type: Schema.Types.Mixed, default: {} },
  indexes: { type: Schema.Types.Mixed, default: {} },
  uiRemote: { type: String },
  status: {
    type: String,
    enum: ['installed', 'disabled'],
    default: 'installed',
  },
  installedBy: { type: String, required: true },
  installedAt: { type: Date, default: Date.now },
});

// Every build a tenant installed, so a rollback is a pointer swap. Its UI
// files stay in extension_assets under the same version.
export type ExtensionBuild = Pick<
  IExtensionDocument,
  | 'code'
  | 'codeHash'
  | 'buildHash'
  | 'typeDefs'
  | 'resolvers'
  | 'collections'
  | 'permissions'
  | 'fieldPermissions'
  | 'operations'
  | 'indexes'
  | 'uiRemote'
>;

// A version can be reinstalled only with an identical install body (same
// buildHash).
export interface IExtensionVersionDocument extends ExtensionBuild {
  _id: string;
  subdomain: string;
  extId: string;
  version: string;
  installedBy: string;
  installedAt: Date;
}

const extensionVersionSchema = new Schema<IExtensionVersionDocument>({
  _id: { type: String, required: true },
  subdomain: { type: String, required: true },
  extId: { type: String, required: true },
  version: { type: String, required: true },
  code: { type: String, required: true },
  codeHash: { type: String, required: true },
  buildHash: { type: String, required: true },
  typeDefs: { type: String, required: true },
  resolvers: { type: Schema.Types.Mixed, default: {} },
  collections: { type: [String], default: [] },
  permissions: { type: Schema.Types.Mixed, default: {} },
  fieldPermissions: { type: Schema.Types.Mixed, default: {} },
  operations: { type: Schema.Types.Mixed, default: {} },
  indexes: { type: Schema.Types.Mixed, default: {} },
  uiRemote: { type: String },
  installedBy: { type: String, required: true },
  installedAt: { type: Date, default: Date.now },
});

extensionVersionSchema.index({ subdomain: 1, extId: 1, installedAt: -1 });

// One built UI file, served to the browser as part of the extension's remote.
export interface IExtensionAssetDocument {
  _id: string;
  subdomain: string;
  extId: string;
  version: string;
  path: string;
  contentType: string;
  content: Buffer;
}

const extensionAssetSchema = new Schema<IExtensionAssetDocument>({
  _id: { type: String, required: true },
  subdomain: { type: String, required: true },
  extId: { type: String, required: true },
  version: { type: String, required: true },
  path: { type: String, required: true },
  contentType: { type: String, required: true },
  content: { type: Buffer, required: true },
});

extensionAssetSchema.index({ subdomain: 1, extId: 1 });

export interface IModels {
  Extensions: Model<IExtensionDocument>;
  ExtensionAssets: Model<IExtensionAssetDocument>;
  ExtensionVersions: Model<IExtensionVersionDocument>;
}

const loadClasses = (db: Connection): IModels => ({
  Extensions: db.model<IExtensionDocument>('extensions', extensionSchema),
  ExtensionAssets: db.model<IExtensionAssetDocument>(
    'extension_assets',
    extensionAssetSchema,
  ),
  ExtensionVersions: db.model<IExtensionVersionDocument>(
    'extension_versions',
    extensionVersionSchema,
  ),
});

export const generateModels = createGenerateModels<IModels>(loadClasses);
