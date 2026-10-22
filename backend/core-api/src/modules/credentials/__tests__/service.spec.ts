import { createCredentialsService, consumeCredential } from '../service';
import type { CredentialAudit } from '../service';
import type { CredentialInput, StoredCredential, StoredCredentialGrant } from '../types';
import type { CredentialStore } from '../store';
import { decryptValues } from '../crypto';
import { hashConsumerToken, issueConsumerToken } from '../tokens';

const environment = {
  CREDENTIALS_VAULT_KEY: Buffer.alloc(32, 7).toString('base64'),
  CREDENTIALS_VAULT_KEY_ID: 'test-v1',
};
const input = (): CredentialInput => ({
  name: 'Synthetic connection', templateId: 'generic', category: 'custom', fields: [
    { key: 'apiKey', action: 'replace', value: 'synthetic-secret' },
    { key: 'endpoint', type: 'url', secret: false, action: 'replace', value: 'https://example.invalid' },
  ],
});

const fixture = () => {
  const records = new Map<string, StoredCredential>();
  const grants = new Map<string, StoredCredentialGrant>();
  const audit = jest.fn<ReturnType<CredentialAudit>, Parameters<CredentialAudit>>(async () => undefined);
  const store: CredentialStore = {
    list: jest.fn(async () => [...records.values()]),
    find: jest.fn(async (id) => records.get(id) || null),
    findReference: jest.fn(async (reference) => [...records.values()].find((record) => record.reference === reference) || null),
    create: jest.fn(async (record) => { records.set(record._id, record); }),
    update: jest.fn(async (record, revision) => {
      if (records.get(record._id)?.revision !== revision) return false;
      records.set(record._id, record);
      return true;
    }),
    remove: jest.fn(async (id) => records.delete(id)),
    grants: jest.fn(async (id) => [...grants.values()].filter((grant) => grant.credentialId === id)),
    createGrant: jest.fn(async (grant) => { grants.set(grant._id, grant); }),
    findGrant: jest.fn(async (hash) => [...grants.values()].find((grant) => grant.tokenHash === hash && !grant.revokedAt) || null),
    revokeGrant: jest.fn(async (id, at) => {
      const grant = grants.get(id);
      if (!grant || grant.revokedAt) return null;
      grant.revokedAt = at;
      return grant;
    }),
    revokeCredentialGrants: jest.fn(async (id, at) => {
      for (const grant of grants.values()) if (grant.credentialId === id) grant.revokedAt = at;
    }),
  };
  const service = createCredentialsService(store, 'tenant-a', audit, environment);
  const consumeAudit = jest.fn(async () => undefined);
  const getStore = jest.fn(async () => store);
  const consume = (token: string, reference: string) => consumeCredential(token, reference, getStore, consumeAudit, environment);
  return { store, records, grants, service, audit, consume, consumeAudit, getStore };
};

describe('credential service boundaries', () => {
  it('persists encrypted values and returns only allowlisted metadata from CRUD/list/detail', async () => {
    const { service, records, audit } = fixture();
    const created = await service.create(input());
    const persisted = records.get(created._id);
    expect(persisted).toBeDefined();
    if (!persisted) throw new Error('Missing test record');
    expect(JSON.stringify(persisted)).not.toContain('synthetic-secret');
    expect(JSON.stringify(persisted)).not.toContain('https://example.invalid');
    expect(decryptValues(persisted.encryptedValues, 'tenant-a', persisted._id, environment)).toEqual({ apiKey: 'synthetic-secret', endpoint: 'https://example.invalid' });
    const updated = await service.update(created._id, { ...input(), fields: [{ key: 'apiKey', action: 'keep' }] });
    for (const result of [created, updated, await service.detail(created._id), await service.list()]) {
      const serialized = JSON.stringify(result);
      for (const forbidden of ['synthetic-secret', 'https://example.invalid', 'encryptedValues', 'ciphertext', 'tenant', 'revision']) {
        expect(serialized).not.toContain(forbidden);
      }
    }
    expect(updated.reference).toBe(created.reference);
    expect(JSON.stringify(audit.mock.calls)).not.toContain('synthetic-secret');
    expect(audit).toHaveBeenCalledWith('create', { credentialId: created._id, templateId: 'generic' });
  });

  it('creates multiple independent instances and supports keep/replace/clear without returning values', async () => {
    const { service, records, consume } = fixture();
    const first = await service.create(input());
    const second = await service.create(input());
    expect(first.reference).not.toBe(second.reference);
    const { token } = await service.issueGrant(first._id, 'testplugin', 'Test consumer');
    const changed = await service.update(first._id, { ...input(), fields: [
      { key: 'apiKey', action: 'replace', value: 'synthetic-replacement' },
      { key: 'endpoint', action: 'clear' },
    ] });
    expect(changed.fields.find((field) => field.key === 'endpoint')?.hasValue).toBe(false);
    expect((await consume(token, first.reference)).values).toEqual({ apiKey: 'synthetic-replacement' });
    expect(records.get(first._id)?.revision).toBe(1);
    expect(records.get(second._id)?.revision).toBe(0);
  });

  it('stores only capability hashes and reads only grant metadata after one-time issuance', async () => {
    const { service, grants, consume, getStore, consumeAudit } = fixture();
    const credential = await service.create(input());
    const issued = await service.issueGrant(credential._id, 'testplugin', 'Test consumer');
    expect(grants.get(issued.grant._id)?.tokenHash).toBe(hashConsumerToken(issued.token));
    expect(JSON.stringify([...grants.values()])).not.toContain(issued.token);
    expect(issued.grant).not.toHaveProperty('tokenHash');
    expect(JSON.stringify(await service.grants(credential._id))).not.toMatch(/tokenHash|tenant/);
    expect((await consume(issued.token, credential.reference)).values.apiKey).toBe('synthetic-secret');
    expect(getStore).toHaveBeenCalledWith('tenant-a');
    expect(consumeAudit).toHaveBeenCalledWith('tenant-a', 'consume', {
      credentialId: credential._id, templateId: 'generic', grantId: issued.grant._id, pluginName: 'testplugin',
    });
  });

  it('rejects forged tenant locators, random capabilities, and references outside an exact grant', async () => {
    const { service, consume } = fixture();
    const first = await service.create(input());
    const second = await service.create(input());
    const { token } = await service.issueGrant(first._id, 'testplugin', 'Test consumer');
    for (const [capability, reference] of [
      [token, second.reference],
      [issueConsumerToken('tenant-a'), first.reference],
      [token.replace(Buffer.from('tenant-a').toString('base64url'), Buffer.from('tenant-b').toString('base64url')), first.reference],
      [token, '../invalid'],
    ]) await expect(consume(capability, reference)).rejects.toThrow('Credential access denied');
  });

  it('revokes without cached authorization and fails closed after deletion', async () => {
    const { service, consume, grants } = fixture();
    const record = await service.create(input());
    const first = await service.issueGrant(record._id, 'testplugin', 'First');
    await consume(first.token, record.reference);
    await service.revokeGrant(first.grant._id);
    await expect(consume(first.token, record.reference)).rejects.toThrow('Credential access denied');
    const second = await service.issueGrant(record._id, 'testplugin', 'Second');
    await service.remove(record._id);
    await expect(consume(second.token, record.reference)).rejects.toThrow('Credential access denied');
    expect(grants.get(second.grant._id)?.revokedAt).toBeInstanceOf(Date);
    expect(await service.detail(record._id)).toBeNull();
  });

  it.each(['grant', 'record', 'revision', 'hash', 'plugin'])(
    'rechecks authorization after decryption against concurrent %s changes', async (change) => {
      const { service, store, grants, records, consume } = fixture();
      const record = await service.create(input());
      const issued = await service.issueGrant(record._id, 'testplugin', 'Test');
      const grant = grants.get(issued.grant._id);
      const stored = records.get(record._id);
      if (!grant || !stored) throw new Error('Missing test fixture');
      let reads = 0;
      store.findGrant = async () => {
        reads++;
        if (reads === 1) return { ...grant };
        if (change === 'grant') return null;
        if (change === 'hash') return { ...grant, tokenHash: 'incorrect' };
        if (change === 'plugin') return { ...grant, pluginName: 'otherplugin' };
        return { ...grant };
      };
      if (change === 'record') store.find = async () => null;
      if (change === 'revision') store.find = async () => ({ ...stored, revision: 1 });
      await expect(consume(issued.token, record.reference)).rejects.toThrow('Credential access denied');
    },
  );

  it('fails before persistence on absent/wrong keys, tampering, validation and write conflicts', async () => {
    const { service, store, records, audit, consume } = fixture();
    const missingKey = createCredentialsService(store, 'tenant-a', audit, {});
    await expect(missingKey.create(input())).rejects.toThrow('Credentials operation unavailable');
    expect(store.create).not.toHaveBeenCalled();
    const record = await service.create(input());
    await expect(missingKey.issueGrant(record._id, 'testplugin', 'Test')).rejects.toThrow('Credentials operation unavailable');
    expect(store.createGrant).not.toHaveBeenCalled();
    const wrongKey = createCredentialsService(store, 'tenant-a', audit, {
      ...environment, CREDENTIALS_VAULT_KEY: Buffer.alloc(32, 8).toString('base64'),
    });
    await expect(wrongKey.update(record._id, input())).rejects.toThrow('Credentials operation unavailable');
    await expect(service.update(record._id, { ...input(), name: '' })).rejects.toThrow('Invalid credential input');
    expect(store.update).not.toHaveBeenCalled();
    store.update = jest.fn(async () => false);
    await expect(service.update(record._id, input())).rejects.toThrow('Credential changed; reload before editing');
    const { token } = await service.issueGrant(record._id, 'testplugin', 'Test');
    const persisted = records.get(record._id);
    if (!persisted) throw new Error('Missing test record');
    persisted.encryptedValues.tag = Buffer.alloc(16).toString('base64');
    await expect(consume(token, record.reference)).rejects.toThrow('Credentials operation unavailable');
  });

  it('checks the stored tenant on management detail/update/delete/grant issuance', async () => {
    const { service, records, store } = fixture();
    const record = await service.create(input());
    const stored = records.get(record._id);
    if (!stored) throw new Error('Missing test record');
    stored.tenant = 'tenant-b';
    expect(await service.detail(record._id)).toBeNull();
    await expect(service.update(record._id, input())).rejects.toThrow('Credential not found');
    await expect(service.remove(record._id)).rejects.toThrow('Credential not found');
    await expect(service.issueGrant(record._id, 'testplugin', 'Test')).rejects.toThrow('Credential not found');
    expect(store.remove).not.toHaveBeenCalled();
    expect(store.update).not.toHaveBeenCalled();
    expect(store.createGrant).not.toHaveBeenCalled();
  });
});
