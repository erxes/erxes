import type { Indexes } from 'erxes-sdk';
import { Connection, Model, Schema } from 'mongoose';
import {
  createGenerateModels,
  mongooseStringRandomId,
} from 'erxes-api-shared/utils';

export interface IExtensionDocument {
  _id: string;
  subdomain: string;
  extId: string;
  version: string;
  code: string;
  // sha256 of `code`. workerd caches loaded workers under it.
  codeHash: string;
  functions: string[];
  collections: string[];
  // module -> action -> title, as the extension declared them.
  permissions: Record<string, Record<string, string>>;
  // function path -> 'module.action' or 'public'.
  functionPermissions: Record<string, string>;
  // Host contract -> the version the build pinned, e.g. { sales: 1 }.
  uses: Record<string, number>;
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
  functions: { type: [String], default: [] },
  collections: { type: [String], default: [] },
  permissions: { type: Schema.Types.Mixed, default: {} },
  functionPermissions: { type: Schema.Types.Mixed, default: {} },
  uses: { type: Schema.Types.Mixed, default: {} },
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

// One function call: who ran what, how it ended and how long it took.
export interface IExtensionRunDocument {
  _id: string;
  subdomain: string;
  extId: string;
  version: string;
  fn: string;
  userId: string;
  status: 'ok' | 'error' | 'timeout';
  error?: { code: string; message: string };
  ms: number;
  createdAt: Date;
}

// Run records expire on their own, so the log can't grow without bound.
const RUN_LOG_TTL_SECONDS = 30 * 24 * 60 * 60;

const extensionRunSchema = new Schema<IExtensionRunDocument>({
  _id: mongooseStringRandomId,
  subdomain: { type: String, required: true },
  extId: { type: String, required: true },
  version: { type: String, required: true },
  fn: { type: String, required: true },
  userId: { type: String, required: true },
  status: {
    type: String,
    enum: ['ok', 'error', 'timeout'],
    required: true,
  },
  error: { type: { code: String, message: String }, _id: false },
  ms: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now, expires: RUN_LOG_TTL_SECONDS },
});

extensionRunSchema.index({ subdomain: 1, extId: 1, createdAt: -1 });

// Every build a tenant installed, so a rollback is a pointer swap. Its UI
// files stay in extension_assets under the same version.
export type ExtensionBuild = Pick<
  IExtensionDocument,
  | 'code'
  | 'codeHash'
  | 'functions'
  | 'collections'
  | 'permissions'
  | 'functionPermissions'
  | 'uses'
  | 'indexes'
  | 'uiRemote'
>;

// A version can be reinstalled only with identical code (same codeHash).
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
  functions: { type: [String], default: [] },
  collections: { type: [String], default: [] },
  permissions: { type: Schema.Types.Mixed, default: {} },
  functionPermissions: { type: Schema.Types.Mixed, default: {} },
  uses: { type: Schema.Types.Mixed, default: {} },
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
  ExtensionRuns: Model<IExtensionRunDocument>;
  ExtensionAssets: Model<IExtensionAssetDocument>;
  ExtensionVersions: Model<IExtensionVersionDocument>;
}

const loadClasses = (db: Connection): IModels => ({
  Extensions: db.model<IExtensionDocument>('extensions', extensionSchema),
  ExtensionRuns: db.model<IExtensionRunDocument>(
    'extension_runs',
    extensionRunSchema,
  ),
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
