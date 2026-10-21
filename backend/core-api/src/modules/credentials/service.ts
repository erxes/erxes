import { randomUUID } from 'node:crypto';
import { decryptValues, encryptValues, readVaultKey } from './crypto';
import type { VaultEnvironment } from './crypto';
import { CredentialsError } from './types';
import type { CredentialGrantMetadata, CredentialInput, StoredCredential, StoredCredentialGrant } from './types';
import type { CredentialStore } from './store';
import { hashConsumerToken, issueConsumerToken, parseConsumerToken, validTenant } from './tokens';
import { boundedText, credentialMetadata, prepareCredential } from './validation';
import { credentialTemplates } from './templates';

export type CredentialAuditAction = 'create' | 'update' | 'delete' | 'grantCreate' | 'grantRevoke' | 'consume';
export interface CredentialAuditMetadata {
  credentialId: string;
  templateId?: string;
  grantId?: string;
  pluginName?: string;
}
export type CredentialAudit = (action: CredentialAuditAction, metadata: CredentialAuditMetadata) => Promise<void>;

export const grantMetadata = (grant: CredentialGrantMetadata): CredentialGrantMetadata => ({
  _id: grant._id, credentialId: grant.credentialId, pluginName: grant.pluginName,
  name: grant.name, createdAt: grant.createdAt, revokedAt: grant.revokedAt,
});

export const createCredentialsService = (
  store: CredentialStore,
  tenant: string,
  audit: CredentialAudit,
  environment: VaultEnvironment = process.env,
) => {
  if (!validTenant(tenant)) throw new CredentialsError('CREDENTIALS_FORBIDDEN');
  const find = async (id: string) => {
    boundedText(id, 100);
    const record = await store.find(id);
    if (!record || record.tenant !== tenant) throw new CredentialsError('CREDENTIALS_NOT_FOUND');
    return record;
  };
  return {
    templates: () => credentialTemplates,
    async list(search?: string | null, category?: string | null) {
      const records = await store.list(
        search == null ? undefined : boundedText(search, 120, false),
        category == null ? undefined : boundedText(category, 64, false),
      );
      return records.map(credentialMetadata);
    },
    async detail(id: string) {
      const record = await store.find(boundedText(id, 100));
      return record && record.tenant === tenant ? credentialMetadata(record) : null;
    },
    async create(input: CredentialInput) {
      const prepared = prepareCredential(input);
      const id = randomUUID();
      const now = new Date();
      const { values, ...metadata } = prepared;
      const record: StoredCredential = {
        ...metadata, _id: id, reference: `cred_${randomUUID()}`, tenant,
        createdAt: now, updatedAt: now, revision: 0,
        encryptedValues: encryptValues(values, tenant, id, environment),
      };
      await store.create(record);
      await audit('create', { credentialId: id, templateId: record.templateId });
      return credentialMetadata(record);
    },
    async update(id: string, input: CredentialInput) {
      const existing = await find(id);
      const previous = decryptValues(existing.encryptedValues, tenant, existing._id, environment);
      const { values, ...metadata } = prepareCredential(input, existing, previous);
      const record: StoredCredential = {
        ...existing, ...metadata, updatedAt: new Date(), revision: existing.revision + 1,
        encryptedValues: encryptValues(values, tenant, existing._id, environment),
      };
      if (!await store.update(record, existing.revision)) throw new CredentialsError('CREDENTIALS_CONFLICT');
      await audit('update', { credentialId: id, templateId: record.templateId });
      return credentialMetadata(record);
    },
    async remove(id: string) {
      const existing = await find(id);
      // Delete first: even a concurrently issued grant cannot retrieve a deleted record.
      if (!await store.remove(id)) throw new CredentialsError('CREDENTIALS_NOT_FOUND');
      await store.revokeCredentialGrants(id, new Date());
      await audit('delete', { credentialId: id, templateId: existing.templateId });
      return true;
    },
    async grants(credentialId: string) {
      await find(credentialId);
      return (await store.grants(credentialId)).map(grantMetadata);
    },
    async issueGrant(credentialId: string, pluginName: string, name: string) {
      const existing = await find(credentialId);
      // Do not issue apparently usable capabilities when vault configuration is absent.
      const { key } = readVaultKey(environment);
      key.fill(0);
      if (typeof pluginName !== 'string' || !/^[a-z][a-z0-9-]{0,63}$/.test(pluginName)) {
        throw new CredentialsError('CREDENTIALS_INVALID_INPUT');
      }
      const token = issueConsumerToken(tenant);
      const grant: StoredCredentialGrant = {
        _id: randomUUID(), tenant, credentialId: existing._id, pluginName,
        name: boundedText(name, 120), tokenHash: hashConsumerToken(token),
        createdAt: new Date(), revokedAt: null,
      };
      await store.createGrant(grant);
      if (!await store.find(credentialId)) {
        await store.revokeGrant(grant._id, new Date());
        throw new CredentialsError('CREDENTIALS_NOT_FOUND');
      }
      await audit('grantCreate', { credentialId, grantId: grant._id, pluginName });
      return { grant: grantMetadata(grant), token };
    },
    async revokeGrant(id: string) {
      const grant = await store.revokeGrant(boundedText(id, 100), new Date());
      if (!grant || grant.tenant !== tenant) throw new CredentialsError('CREDENTIALS_NOT_FOUND');
      await audit('grantRevoke', { credentialId: grant.credentialId, grantId: grant._id, pluginName: grant.pluginName });
      return true;
    },
  };
};

export const consumeCredential = async (
  token: string,
  reference: string,
  getStore: (tenant: string) => Promise<CredentialStore>,
  audit: (tenant: string, action: CredentialAuditAction, metadata: CredentialAuditMetadata) => Promise<void>,
  environment: VaultEnvironment = process.env,
) => {
  const { tenant, tokenHash } = parseConsumerToken(token);
  if (typeof reference !== 'string' || !/^cred_[0-9a-f-]{36}$/.test(reference)) {
    throw new CredentialsError('CREDENTIALS_FORBIDDEN');
  }
  const store = await getStore(tenant);
  const grant = await store.findGrant(tokenHash);
  if (!grant || grant.tenant !== tenant || grant.revokedAt || grant.tokenHash !== tokenHash ||
      !/^[a-z][a-z0-9-]{0,63}$/.test(grant.pluginName)) throw new CredentialsError('CREDENTIALS_FORBIDDEN');
  const record = await store.findReference(reference);
  if (!record || record.tenant !== tenant || record._id !== grant.credentialId) {
    throw new CredentialsError('CREDENTIALS_FORBIDDEN');
  }
  const values = decryptValues(record.encryptedValues, tenant, record._id, environment);
  // Recheck after decryption; never cache a capability or its authorization.
  const [activeGrant, activeRecord] = await Promise.all([store.findGrant(tokenHash), store.find(record._id)]);
  if (!activeGrant || activeGrant.revokedAt || activeGrant.tenant !== tenant ||
      activeGrant._id !== grant._id || activeGrant.tokenHash !== tokenHash ||
      activeGrant.credentialId !== record._id || activeGrant.pluginName !== grant.pluginName ||
      !activeRecord || activeRecord._id !== record._id || activeRecord.reference !== reference ||
      activeRecord.tenant !== tenant || activeRecord.revision !== record.revision) {
    throw new CredentialsError('CREDENTIALS_FORBIDDEN');
  }
  await audit(tenant, 'consume', { credentialId: record._id, templateId: record.templateId,
    grantId: grant._id, pluginName: grant.pluginName });
  return { reference: record.reference, templateId: record.templateId, values };
};
