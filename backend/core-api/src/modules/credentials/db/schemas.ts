import { Schema } from 'mongoose';
import { schemaWrapper } from 'erxes-api-shared/utils';
import type { StoredCredential, StoredCredentialGrant } from '../types';

// Vault models attach no generic event or full-document capture hooks.
const vaultSchemaOptions = {
  strict: 'throw',
  versionKey: false,
} as const;

const fieldSchema = new Schema({
  key: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, enum: ['text', 'password', 'number', 'url', 'boolean'], required: true },
  secret: { type: Boolean, required: true },
  required: { type: Boolean, required: true },
  help: String,
  hasValue: { type: Boolean, required: true },
}, { _id: false, strict: 'throw' });

const envelopeSchema = new Schema({
  version: { type: Number, required: true },
  keyId: { type: String, required: true },
  nonce: { type: String, required: true },
  ciphertext: { type: String, required: true },
  tag: { type: String, required: true },
}, { _id: false, strict: 'throw' });

const credentialSchema = new Schema<StoredCredential>({
  tenant: { type: String, required: true, immutable: true },
  reference: { type: String, required: true, immutable: true },
  templateId: { type: String, required: true, immutable: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, required: true },
  fields: { type: [fieldSchema], required: true },
  encryptedValues: { type: envelopeSchema, required: true, select: false },
  revision: { type: Number, required: true, default: 0 },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
}, vaultSchemaOptions);

const grantSchema = new Schema<StoredCredentialGrant>({
  tenant: { type: String, required: true, immutable: true },
  credentialId: { type: String, required: true, immutable: true },
  pluginName: { type: String, required: true, immutable: true },
  name: { type: String, required: true },
  tokenHash: { type: String, required: true, immutable: true, select: false },
  createdAt: { type: Date, required: true },
  revokedAt: { type: Date, default: null },
}, vaultSchemaOptions);

export const credentialsSchema = schemaWrapper(credentialSchema);
export const credentialGrantsSchema = schemaWrapper(grantSchema);
credentialsSchema.index({ tenant: 1, reference: 1 }, { unique: true });
credentialsSchema.index({ tenant: 1, category: 1, updatedAt: -1 });
credentialGrantsSchema.index({ tokenHash: 1 }, { unique: true });
credentialGrantsSchema.index({ tenant: 1, credentialId: 1, createdAt: -1 });
