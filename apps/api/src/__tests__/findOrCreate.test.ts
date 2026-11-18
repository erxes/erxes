import { describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

describe('customers for plugins (find or create)', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  it('finds by email or phone (any of theirs), or creates, once, even when asked twice at once', async () => {
    const hr = t.hr();

    const [first, second] = await Promise.all([
      hr.customers.findOrCreate({ primaryEmail: 'Applicant@Mail.mn', firstName: 'Saraa' }),
      hr.customers.findOrCreate({ primaryEmail: 'applicant@mail.mn' }),
    ]);

    expect([first.created, second.created].toSorted((a, b) => Number(a) - Number(b))).toEqual([
      false,
      true,
    ]);
    expect(first.customer.id).toBe(second.customer.id);

    const { id } = first.customer;

    // Another of their numbers and emails find them too.
    await t.owner().customers.update({ id, phones: ['99112233'], primaryPhone: '99112233' });
    expect(await hr.customers.findOrCreate({ primaryPhone: '9911 2233' })).toMatchObject({
      created: false,
      customer: { id },
    });

    // The plugin can read what it found; the audit log says the plugin created it.
    expect((await hr.customers.get({ id })).primaryEmail).toBe('applicant@mail.mn');

    const audit = await t.owner().audit.list({ targetId: id, action: 'customer.created' });

    expect(audit.data[0]).toMatchObject({ actorType: 'plugin', actorId: 'hr', source: 'hr' });
  });

  it('creates a customer known only by name each time, as create does', async () => {
    const hr = t.hr();

    const first = await hr.customers.findOrCreate({ firstName: 'Walk-in', lastName: 'Guest' });
    const second = await hr.customers.findOrCreate({ firstName: 'Walk-in', lastName: 'Guest' });

    expect(first).toMatchObject({
      created: true,
      customer: { firstName: 'Walk-in', primaryEmail: null, primaryPhone: null },
    });
    expect(second.created).toBe(true);
    expect(second.customer.id).not.toBe(first.customer.id);
  });

  it('refuses a call with nothing to find or name, naming the fields it needs', async () => {
    await expect(t.hr().customers.findOrCreate({ firstName: '  ' })).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_INPUT',
      data: {
        issues: [
          { path: [], message: 'firstName, lastName, primaryEmail or primaryPhone is required' },
        ],
      },
    });
  });

  it('needs the customers scopes', async () => {
    const service = t.client(await t.pluginToken());

    await service.plugins.registerManifest({
      title: 'HR',
      version: '1',
      scopes: ['notifications:write'],
    });

    const narrow = t.hr();

    await expect(
      narrow.customers.findOrCreate({ primaryEmail: 'x@mail.mn' }),
    ).rejects.toMatchObject({ code: 'SCOPE_REQUIRED' });
    await expect(narrow.customers.list({})).rejects.toMatchObject({ code: 'SCOPE_REQUIRED' });
  });
});
