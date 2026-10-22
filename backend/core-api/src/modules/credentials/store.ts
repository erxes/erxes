import type { Model } from 'mongoose';
import type { CredentialGrantMetadata, CredentialMetadata, StoredCredential, StoredCredentialGrant } from './types';

export interface CredentialStore {
  list(search?: string, category?: string): Promise<CredentialMetadata[]>;
  find(id: string): Promise<StoredCredential | null>;
  findReference(reference: string): Promise<StoredCredential | null>;
  create(record: StoredCredential): Promise<void>;
  update(record: StoredCredential, previousRevision: number): Promise<boolean>;
  remove(id: string): Promise<boolean>;
  grants(credentialId: string): Promise<CredentialGrantMetadata[]>;
  createGrant(grant: StoredCredentialGrant): Promise<void>;
  findGrant(tokenHash: string): Promise<StoredCredentialGrant | null>;
  revokeGrant(id: string, at: Date): Promise<StoredCredentialGrant | null>;
  revokeCredentialGrants(credentialId: string, at: Date): Promise<void>;
}

const metadataProjection = '_id reference name description templateId category fields createdAt updatedAt';
const grantProjection = '_id credentialId pluginName name createdAt revokedAt';

export const createCredentialStore = (
  models: { Credentials: Model<StoredCredential>; CredentialGrants: Model<StoredCredentialGrant> },
  tenant: string,
): CredentialStore => ({
  async list(search, category) {
    const literalSearch = search?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return models.Credentials.find({
      tenant,
      ...(category ? { category } : {}),
      ...(literalSearch ? { name: { $regex: literalSearch, $options: 'i' } } : {}),
    }).select(metadataProjection).sort({ updatedAt: -1, _id: 1 }).limit(200).lean();
  },
  async find(id) {
    return models.Credentials.findOne({ _id: id, tenant }).select('+encryptedValues').lean();
  },
  async findReference(reference) {
    return models.Credentials.findOne({ reference, tenant }).select('+encryptedValues').lean();
  },
  async create(record) { await models.Credentials.create(record); },
  async update(record, previousRevision) {
    const result = await models.Credentials.updateOne(
      { _id: record._id, tenant, revision: previousRevision },
      { $set: {
        name: record.name, description: record.description, category: record.category,
        fields: record.fields, encryptedValues: record.encryptedValues,
        updatedAt: record.updatedAt, revision: record.revision,
      } },
    );
    return result.modifiedCount === 1;
  },
  async remove(id) {
    const result = await models.Credentials.deleteOne({ _id: id, tenant });
    return result.deletedCount === 1;
  },
  async grants(credentialId) {
    return models.CredentialGrants.find({ credentialId, tenant }).select(grantProjection)
      .sort({ createdAt: -1, _id: 1 }).limit(200).lean();
  },
  async createGrant(grant) { await models.CredentialGrants.create(grant); },
  async findGrant(tokenHash) {
    return models.CredentialGrants.findOne({ tokenHash, tenant, revokedAt: null }).select('+tokenHash').lean();
  },
  async revokeGrant(id, at) {
    return models.CredentialGrants.findOneAndUpdate(
      { _id: id, tenant, revokedAt: null }, { $set: { revokedAt: at } }, { new: true },
    ).lean();
  },
  async revokeCredentialGrants(credentialId, at) {
    await models.CredentialGrants.updateMany({ tenant, credentialId, revokedAt: null }, { $set: { revokedAt: at } });
  },
});
