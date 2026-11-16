import { users } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { READ_CONTACTS, SETUP } from './apiKeySupport';
import { adminDb, useTestDatabase } from './db';
import { useTwoOrgs } from './support';

describe('API key attacks', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  const ids = { lesser: '', customer: '', file: '' };

  beforeAll(async () => {
    const owner = t.owner();
    const lesser = await owner.roles.create({ name: 'Lesser', permissions: ['api_keys.create'] });
    const customer = await owner.customers.create({ firstName: 'Nora', ownerId: t.ids.owner });

    const started = await owner.files.createUpload({
      name: 'contract.txt',
      contentType: 'text/plain',
      size: 6,
    });

    await fetch(t.url(started.upload.url), {
      method: 'PUT',
      headers: started.upload.headers,
      body: Buffer.from('secret'),
    });
    await owner.files.complete({ id: started.file.id });

    Object.assign(ids, { lesser: lesser.key, customer: customer.id, file: started.file.id });
  });

  const adminMember = () =>
    adminDb()
      .update(users)
      .set({ role: 'admin', status: 'active' })
      .where(eq(users.id, t.ids.member));

  it('drops a regular key to what the maker’s new role allows', async () => {
    await adminMember();

    const { key } = await t.member().apiKeys.create({
      ...READ_CONTACTS,
      name: 'Demoted maker',
      areas: { contacts: 'write' },
      lifetimeDays: 30,
    });

    await t.client(key).customers.get({ id: ids.customer });
    await t.owner().users.update({ id: t.ids.member, role: ids.lesser });

    await expect(t.client(key).customers.get({ id: ids.customer })).rejects.toMatchObject({
      code: 'KEY_NOT_ALLOWED',
    });
    await expect(t.client(key).customers.remove({ ids: [ids.customer] })).rejects.toMatchObject({
      code: 'KEY_NOT_ALLOWED',
    });
  });

  it('keeps keys without the Files area away from file downloads', async () => {
    const setup = await t.owner().apiKeys.create({ ...SETUP, name: 'Setup', lifetimeDays: 30 });

    const data = await t.owner().apiKeys.create({
      ...READ_CONTACTS,
      name: 'Contacts only',
      lifetimeDays: 30,
    });

    await expect(t.client(setup.key).files.get({ id: ids.file })).rejects.toMatchObject({
      code: 'KEY_NOT_ALLOWED',
    });

    for (const key of [setup.key, data.key]) {
      const download = await fetch(t.url(`/core/v1/files/${ids.file}/download`), {
        headers: t.headers(key),
        redirect: 'manual',
      });

      expect(download.status).toBe(403);
    }
  });

  it('keeps contact names out of what a management key reads in the audit log', async () => {
    const gone = await t.owner().customers.create({ firstName: 'Zorigt', ownerId: t.ids.owner });

    await t.owner().customers.remove({ ids: [gone.id] });

    const binned = (await t.owner().trash.list({})).data.find((item) => item.recordId === gone.id);

    await t.owner().trash.restore({ ids: [binned?.id ?? ''] });

    const { key } = await t.owner().apiKeys.create({ ...SETUP, name: 'Auditor', lifetimeDays: 30 });

    await expect(t.client(key).audit.list({ limit: 100 })).rejects.toMatchObject({
      code: 'KEY_NOT_ALLOWED',
      data: { rule: 'never' },
    });

    const exported = await fetch(t.url('/core/v1/audit/export?format=json'), {
      headers: t.headers(key),
    });

    expect(exported.status).toBe(403);
    expect(await exported.text()).not.toContain('Zorigt');
  });

  it('refuses contact limits on a key that opens areas outside them', async () => {
    for (const area of ['automations', 'files', 'payments'] as const) {
      await expect(
        t.owner().apiKeys.create({
          ...READ_CONTACTS,
          name: `Own contacts and ${area}`,
          areas: { contacts: 'read', [area]: 'read' },
          ownRecords: true,
          lifetimeDays: 30,
        }),
      ).rejects.toMatchObject({ code: 'INVALID_INPUT' });
    }

    const { key } = await t.owner().apiKeys.create({
      ...READ_CONTACTS,
      name: 'Own contacts and products',
      areas: { contacts: 'read', products: 'read' },
      ownRecords: true,
      lifetimeDays: 30,
    });

    await expect(t.client(key).automations.list({})).rejects.toMatchObject({
      code: 'KEY_NOT_ALLOWED',
    });
  });
});
