import mongoose from 'mongoose';
import { credentialsSchema, credentialGrantsSchema } from '../db/schemas';
import { createCredentialStore } from '../store';
import { createCredentialsService } from '../service';
import type { StoredCredential, StoredCredentialGrant } from '../types';

// Load the real platform schema wrapper without starting shared Redis utilities.
jest.mock('../../../../../erxes-api-shared/src/utils/mongo/cursor-util', () => ({}));
jest.mock('erxes-api-shared/utils', () => ({
  schemaWrapper: jest.requireActual('../../../../../erxes-api-shared/src/utils/mongo/mongoose-utils').schemaWrapper,
}), { virtual: true });

const Credentials = mongoose.model<StoredCredential>('credentials-vault-test', credentialsSchema);
const CredentialGrants = mongoose.model<StoredCredentialGrant>('credential-grants-vault-test', credentialGrantsSchema);
const store = createCredentialStore({ Credentials, CredentialGrants }, 'tenant-a');
const environment = {
  CREDENTIALS_VAULT_KEY: Buffer.alloc(32, 7).toString('base64'),
  CREDENTIALS_VAULT_KEY_ID: 'test-v1',
};
const insertedResult = { acknowledged: true, insertedId: new mongoose.Types.ObjectId() };
const updatedResult = { acknowledged: true, matchedCount: 1, modifiedCount: 1, upsertedCount: 0, upsertedId: null };
const client = new mongoose.mongo.MongoClient('mongodb://127.0.0.1:27017');
const emptyCursor = () => {
  // Construct the real driver cursor, but never connect to MongoDB.
  const cursor = client.db('credentials-test').collection('credentials').find();
  jest.spyOn(cursor, 'toArray').mockResolvedValue([]);
  return cursor;
};

afterEach(() => jest.restoreAllMocks());
afterAll(async () => { await client.close(); });

describe('Mongoose vault persistence', () => {
  it('passes only encrypted values and hashed capabilities through actual schema casting into inserts', async () => {
    const insert = jest.spyOn(Credentials.collection, 'insertOne').mockResolvedValue(insertedResult);
    const insertGrant = jest.spyOn(CredentialGrants.collection, 'insertOne').mockResolvedValue(insertedResult);
    const service = createCredentialsService(store, 'tenant-a', async () => undefined, environment);
    const metadata = await service.create({ name: 'Synthetic', templateId: 'generic', category: 'custom', fields: [
      { key: 'apiKey', action: 'replace', value: 'synthetic-secret' },
    ] });
    expect(insert).toHaveBeenCalledTimes(1);
    const inserted = insert.mock.calls[0][0];
    expect(inserted).toMatchObject({ _id: metadata._id, tenant: 'tenant-a', encryptedValues: { version: 1, keyId: 'test-v1' } });
    expect(JSON.stringify(inserted)).not.toContain('synthetic-secret');
    jest.spyOn(Credentials.collection, 'findOne').mockResolvedValue(inserted);
    const issued = await service.issueGrant(metadata._id, 'testplugin', 'Test');
    expect(insertGrant).toHaveBeenCalledTimes(1);
    expect(insertGrant.mock.calls[0][0]).toMatchObject({ tenant: 'tenant-a', credentialId: metadata._id, pluginName: 'testplugin' });
    expect(JSON.stringify(insertGrant.mock.calls)).not.toContain(issued.token);
  });

  it('projects metadata and bounds list/grant reads while escaping literal search', async () => {
    const find = jest.spyOn(Credentials.collection, 'find').mockReturnValue(emptyCursor());
    const findGrants = jest.spyOn(CredentialGrants.collection, 'find').mockReturnValue(emptyCursor());
    await store.list('.*', 'custom');
    expect(find.mock.calls[0][0]).toEqual({ tenant: 'tenant-a', category: 'custom', name: { $regex: '\\.\\*', $options: 'i' } });
    expect(find.mock.calls[0][1]).toMatchObject({ limit: 200, projection: { _id: 1, reference: 1, fields: 1 } });
    expect(find.mock.calls[0][1]?.projection).not.toHaveProperty('encryptedValues');
    await store.grants('record-a');
    expect(findGrants.mock.calls[0][0]).toEqual({ tenant: 'tenant-a', credentialId: 'record-a' });
    expect(findGrants.mock.calls[0][1]).toMatchObject({ limit: 200, projection: { _id: 1, credentialId: 1 } });
    expect(findGrants.mock.calls[0][1]?.projection).not.toHaveProperty('tokenHash');
  });

  it('scopes every lookup/update/delete/revoke to the tenant and uses revision checks', async () => {
    const find = jest.spyOn(Credentials.collection, 'findOne').mockResolvedValue(null);
    const findGrant = jest.spyOn(CredentialGrants.collection, 'findOne').mockResolvedValue(null);
    const remove = jest.spyOn(Credentials.collection, 'deleteOne').mockResolvedValue({ acknowledged: true, deletedCount: 1 });
    const revoke = jest.spyOn(CredentialGrants.collection, 'findOneAndUpdate').mockResolvedValue(null);
    const revokeAll = jest.spyOn(CredentialGrants.collection, 'updateMany').mockResolvedValue(updatedResult);
    await store.find('record-a');
    expect(find.mock.calls[0][0]).toEqual({ _id: 'record-a', tenant: 'tenant-a' });
    await store.findReference('cred_test');
    expect(find.mock.calls[1][0]).toEqual({ reference: 'cred_test', tenant: 'tenant-a' });
    await store.findGrant('hash');
    expect(findGrant.mock.calls[0][0]).toEqual({ tenant: 'tenant-a', tokenHash: 'hash', revokedAt: null });
    await store.remove('record-a');
    expect(remove.mock.calls[0][0]).toEqual({ _id: 'record-a', tenant: 'tenant-a' });
    await store.revokeGrant('grant-a', new Date());
    expect(revoke.mock.calls[0][0]).toEqual({ _id: 'grant-a', tenant: 'tenant-a', revokedAt: null });
    await store.revokeCredentialGrants('record-a', new Date());
    expect(revokeAll.mock.calls[0][0]).toEqual({ credentialId: 'record-a', tenant: 'tenant-a', revokedAt: null });
    const update = jest.spyOn(Credentials.collection, 'updateOne').mockResolvedValue(updatedResult);
    const insert = jest.spyOn(Credentials.collection, 'insertOne').mockResolvedValue(insertedResult);
    const service = createCredentialsService(store, 'tenant-a', async () => undefined, environment);
    const metadata = await service.create({ name: 'Synthetic', templateId: 'generic', category: 'custom', fields: [
      { key: 'apiKey', action: 'replace', value: 'synthetic-secret' },
    ] });
    find.mockResolvedValue(insert.mock.calls[0][0]);
    const record = await store.find(metadata._id);
    if (!record) throw new Error('Missing test record');
    expect(await store.update({ ...record, revision: 1 }, 0)).toBe(true);
    expect(update.mock.calls[0][0]).toEqual({ _id: record._id, tenant: 'tenant-a', revision: 0 });
    expect(JSON.stringify(update.mock.calls)).not.toContain('synthetic-secret');
  });

  it('rejects unexpected plaintext properties and hides envelopes/hashes by default', () => {
    expect(credentialsSchema.path('encryptedValues').options.select).toBe(false);
    expect(credentialGrantsSchema.path('tokenHash').options.select).toBe(false);
    for (const schema of [credentialsSchema, credentialGrantsSchema]) {
      expect(schema.path('_id').instance).toBe('String');
    }
    expect(() => new Credentials({ plaintext: 'synthetic-secret' })).toThrow();
    expect(() => new CredentialGrants({ token: 'synthetic-token' })).toThrow();
  });
});
