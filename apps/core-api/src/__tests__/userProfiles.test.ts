import { beforeAll, expect, it } from 'vite-plus/test';
import { describeWithDb, useTestDatabase } from './db';
import { type CoreClient, type CoreInputs, useTwoOrgs } from './support';

const emails = (page: { data: { email: string }[] }) => page.data.map((user) => user.email);

/** Profile details, bulk invitations, passwords and emails of team members. */
describeWithDb('team member profiles', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  let admin: CoreClient;

  beforeAll(async () => {
    const bat = await t.owner().users.inviteMany({
      entries: [{ email: 'bat@acme.mn', role: 'admin', password: 'Admin-pass-1' }],
    });

    admin = t.client({ user: bat.data[0]?.id ?? '', org: t.ids.org });
  });

  const update = (id: string, changes: Omit<CoreInputs['users']['update'], 'id'>, as = t.owner()) =>
    as.users.update({ id, ...changes });

  /** Whether the email and password sign in to Acme. */
  const signsIn = (email: string, password: string) =>
    t
      .client()
      .auth.signIn({ email, password, subdomain: 'acme' })
      .then(
        () => true,
        () => false,
      );

  it('keeps profile details, and the full name in step with the name parts', async () => {
    expect(
      await update(t.ids.owner, {
        firstName: 'Bold',
        lastName: 'Baatar',
        employeeId: 'E-001',
        birthDate: '1990-01-02',
        workStartedDate: '2024-05-01',
        phone: '+976 9911 2233',
        links: { website: 'erxes.io', github: 'erxes' },
      }),
    ).toMatchObject({
      fullName: 'Bold Baatar',
      firstName: 'Bold',
      lastName: 'Baatar',
      employeeId: 'E-001',
      birthDate: '1990-01-02',
      links: { website: 'erxes.io', github: 'erxes' },
    });
    expect(await update(t.ids.owner, { links: { website: null }, employeeId: '' })).toMatchObject({
      links: { github: 'erxes' },
      employeeId: null,
    });

    // A full name alone (older clients, the user menu) splits into first and last name.
    expect(await update(t.ids.owner, { fullName: 'Owner Of Acme' })).toMatchObject({
      firstName: 'Owner',
      middleName: null,
      lastName: 'Of Acme',
    });

    const dorj = await t.owner().users.invite({ email: 'dorj@acme.mn', fullName: 'Dorj' });

    expect(dorj).toMatchObject({ fullName: 'Dorj', firstName: 'Dorj', lastName: null });
    await update(dorj.id, { employeeId: 'E-777' });
    expect(emails(await t.owner().users.list({ search: 'E-777' }))).toEqual(['dorj@acme.mn']);
    await expect(update(t.ids.owner, { birthDate: '02/01/1990' })).rejects.toMatchObject({
      code: 'INVALID_INPUT',
    });
  });

  it('invites several members at once, all or none', async () => {
    const invite = (entries: CoreInputs['users']['inviteMany']['entries'], as = t.owner()) =>
      as.users.inviteMany({ entries });

    const created = await invite([
      { email: 'Many1@acme.mn' },
      { email: 'many2@acme.mn', role: 'admin', password: 'Secret-pass-1' },
    ]);

    expect(created.data.map(({ email, status, role }) => ({ email, status, role }))).toEqual([
      { email: 'many1@acme.mn', status: 'invited', role: 'member' },
      { email: 'many2@acme.mn', status: 'active', role: 'admin' },
    ]);
    expect(created.data[1]).not.toHaveProperty('passwordHash');
    // Invited with a password: they can sign in at once.
    expect(await signsIn('many2@acme.mn', 'Secret-pass-1')).toBe(true);
    expect(await signsIn('many1@acme.mn', 'Secret-pass-1')).toBe(false);

    await expect(
      invite([{ email: 'MANY1@acme.mn' }, { email: 'many3@acme.mn' }]),
    ).rejects.toMatchObject({
      status: 409,
      code: 'EMAIL_TAKEN',
      data: { emails: ['many1@acme.mn'] },
    });
    expect((await t.owner().users.list({ search: 'many3' })).totalCount).toBe(0);
    await expect(
      invite([{ email: 'many4@acme.mn' }, { email: 'Many4@acme.mn' }]),
    ).rejects.toMatchObject({ code: 'EMAIL_TAKEN' });
    await expect(invite([{ email: 'many5@acme.mn', password: 'short' }])).rejects.toMatchObject({
      code: 'INVALID_INPUT',
    });
    await expect(invite([{ email: 'many6@acme.mn' }], t.member())).rejects.toMatchObject({
      status: 403,
    });
  });

  it('lists active or disabled members', async () => {
    const active = await t.owner().users.list({ isActive: 'true', limit: 100 });

    expect(active.data.filter((user) => user.status === 'disabled')).toEqual([]);
    expect(emails(active)).not.toContain('gone@acme.mn');
    expect(emails(await t.owner().users.list({ isActive: 'false', limit: 100 }))).toEqual([
      'gone@acme.mn',
    ]);
  });

  it('sets a member password (owners and admins; owners only for owners; never their own)', async () => {
    const { id } = await t.owner().users.invite({ email: 'reset@acme.mn' });
    const reset = await t.owner().users.setPassword({ id, password: 'Reset-pass-1' });

    expect(reset.status).toBe('active');
    expect(reset).not.toHaveProperty('passwordHash');
    expect(await signsIn('reset@acme.mn', 'Reset-pass-1')).toBe(true);

    await expect(
      t.owner().users.setPassword({ id: t.ids.owner, password: 'Reset-pass-1' }),
    ).rejects.toMatchObject({ code: 'OWN_ACCOUNT' });
    await expect(t.owner().users.setPassword({ id, password: 'weak' })).rejects.toMatchObject({
      code: 'INVALID_INPUT',
    });
    await expect(
      admin.users.setPassword({ id: t.ids.owner, password: 'Reset-pass-1' }),
    ).rejects.toMatchObject({ code: 'OWNER_ONLY' });
    expect((await admin.users.setPassword({ id, password: 'Reset-pass-2' })).status).toBe('active');
    await expect(
      t.member().users.setPassword({ id, password: 'Reset-pass-3' }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('changes emails: unique in the organisation, owners only for an owner', async () => {
    const { id } = await t.owner().users.invite({ email: 'rename@acme.mn' });

    expect((await update(id, { email: ' Renamed@Acme.mn ' })).email).toBe('renamed@acme.mn');
    await expect(update(id, { email: 'bat@acme.mn' })).rejects.toMatchObject({
      status: 409,
      code: 'EMAIL_TAKEN',
    });
    await expect(update(t.ids.owner, { email: 'mine@acme.mn' }, admin)).rejects.toMatchObject({
      code: 'OWNER_ONLY',
    });
    expect((await update(id, { email: 'renamed2@acme.mn' }, admin)).email).toBe('renamed2@acme.mn');
  });
});
