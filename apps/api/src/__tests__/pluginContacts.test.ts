import { describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

describe('contacts and members for plugins', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  it('lists, searches, creates, updates and links contacts, as the plugin', async () => {
    const hr = t.hr();

    // A chat visitor known only by name: no email or phone to find them by.
    const visitor = await hr.customers.create({ firstName: 'Bold', state: 'lead' });

    expect(visitor).toMatchObject({ state: 'lead', source: 'plugin' });

    const updated = await hr.customers.update({
      id: visitor.id,
      primaryEmail: 'bold@mail.mn',
      emails: ['bold@mail.mn'],
    });

    expect(updated.primaryEmail).toBe('bold@mail.mn');
    expect((await hr.customers.list({ search: 'bold@mail' })).data.map((row) => row.id)).toEqual([
      visitor.id,
    ]);

    const company = await hr.companies.create({ primaryName: 'Nomad LLC' });

    await hr.companies.update({ id: company.id, website: 'https://nomad.mn' });
    await hr.customers.linkCompany({ id: visitor.id, companyId: company.id, role: 'Buyer' });

    expect((await hr.customers.companies({ id: visitor.id })).data[0]).toMatchObject({
      id: company.id,
    });
    expect((await hr.companies.people({ id: company.id })).data[0]).toMatchObject({
      id: visitor.id,
    });
    expect((await hr.companies.list({ search: 'Nomad' })).data[0]).toMatchObject({
      id: company.id,
      website: 'https://nomad.mn',
    });

    // The audit log names the plugin, and the other organisation sees none of it.
    const audit = await t.owner().audit.list({ targetId: visitor.id, action: 'customer.updated' });

    expect(audit.data[0]).toMatchObject({ actorType: 'plugin', actorId: 'hr' });
    expect((await t.other().customers.list({ search: 'bold' })).data).toEqual([]);
  });

  it('reads team members', async () => {
    const hr = t.hr();

    const team = await hr.users.list({ isActive: true });

    expect(team.data.map((user) => user.email).toSorted((a, b) => a.localeCompare(b))).toEqual([
      'member@acme.mn',
      'owner@acme.mn',
    ]);
    expect(await hr.users.get({ id: t.ids.member })).toMatchObject({ email: 'member@acme.mn' });
  });

  it('needs the scopes, and leaves deleting, merging, tagging and the team to members', async () => {
    const service = t.client(await t.pluginToken());

    await service.plugins.registerManifest({
      title: 'HR',
      version: '1',
      scopes: ['customers:read'],
    });

    const reader = t.hr();
    const { id } = await t.owner().customers.create({ firstName: 'Saraa' });

    expect((await reader.customers.list({})).data.map((row) => row.id)).toContain(id);
    await expect(reader.customers.update({ id, firstName: 'Sara' })).rejects.toMatchObject({
      code: 'SCOPE_REQUIRED',
    });
    await expect(reader.companies.create({ primaryName: 'Gobi' })).rejects.toMatchObject({
      code: 'SCOPE_REQUIRED',
    });
    await expect(reader.users.list({})).rejects.toMatchObject({ code: 'SCOPE_REQUIRED' });
    await expect(reader.customers.remove({ ids: [id] })).rejects.toMatchObject({
      code: 'MEMBERS_ONLY',
    });
    const twin = await t.owner().customers.create({ firstName: 'Saraa' });

    await expect(reader.customers.merge({ keepId: id, ids: [id, twin.id] })).rejects.toMatchObject({
      code: 'MEMBERS_ONLY',
    });
    await expect(reader.customers.tag({ ids: [id], add: [] })).rejects.toMatchObject({
      code: 'MEMBERS_ONLY',
    });
    await expect(reader.users.invite({ email: 'x@acme.mn' })).rejects.toMatchObject({
      code: 'MEMBERS_ONLY',
    });
  });
});
