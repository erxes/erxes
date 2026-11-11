import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { accessToken, useTestDatabase, useTestServer } from './support';

const firstId = (page: { data: { id: string }[] }) => {
  const [first] = page.data;

  if (!first) throw new Error('Expected at least one row');

  return first.id;
};

const activate = async (id: string, passwordHash?: string) => {
  const { db, users } = await import('@erxes/core-db');
  const { eq } = await import('drizzle-orm');

  // Drizzle leaves out undefined values, so no hash keeps the current one
  await db().update(users).set({ status: 'active', passwordHash }).where(eq(users.id, id));
};

describe('team members (/core/v1/users)', () => {
  useTestDatabase();

  const server = useTestServer();
  const anonymous = server.client();
  let owner = server.client();
  let otherOrg = server.client();
  let ownerId = '';
  let orgId = '';

  beforeAll(async () => {
    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'Owner@Acme.mn', fullName: 'Owner' },
    });

    const globex = await createOrganization({
      subdomain: 'globex',
      name: 'Globex',
      owner: { email: 'owner@globex.mn' },
    });

    ownerId = acme.owner.id;
    orgId = acme.organization.id;
    owner = server.client({ user: ownerId, org: orgId });
    otherOrg = server.client({ user: globex.owner.id, org: globex.organization.id });
  });

  const memberClient = (id: string) => server.client({ user: id, org: orgId });

  const clientOf = async (email: string) =>
    memberClient(firstId(await owner.users.list({ search: email })));

  const signInAs = (email: string, password: string) =>
    anonymous.auth.signIn({ email, password, subdomain: 'acme' });

  it('refuses requests without a valid token', async () => {
    await expect(anonymous.users.list({})).rejects.toMatchObject({ status: 401 });
    await expect(server.client('not-a-token').users.list({})).rejects.toMatchObject({
      status: 401,
    });
  });

  it('returns the current organisation', async () => {
    expect(await owner.organizations.current()).toMatchObject({ subdomain: 'acme', name: 'Acme' });
  });

  it('invites a member with a lowercased email and never returns credentials', async () => {
    const invited = await owner.users.invite({
      email: ' Bat@Acme.MN ',
      fullName: 'Bat',
      role: 'admin',
    });

    expect(server.status()).toBe(201);
    expect(invited).toMatchObject({ email: 'bat@acme.mn', role: 'admin', status: 'invited' });
    expect(invited).not.toHaveProperty('passwordHash');
    expect(invited).not.toHaveProperty('orgId');
  });

  it('refuses a second member with the same email (any case)', async () => {
    await expect(owner.users.invite({ email: 'BAT@acme.mn' })).rejects.toMatchObject({
      status: 409,
      code: 'EMAIL_TAKEN',
    });
  });

  it('validates input against the contract', async () => {
    // Raw HTTP: an owner role is not even a valid input type for the client
    const response = await fetch(server.url('/core/v1/users'), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...server.headers(await accessToken(ownerId, orgId)),
      },
      body: JSON.stringify({ email: 'not-an-email', role: 'owner' }),
    });

    const body: unknown = await response.json();

    expect(response.status).toBe(400);
    expect(body).toMatchObject({ code: 'INVALID_INPUT' });
  });

  it('lists, searches and pages team members of the caller organisation only', async () => {
    await owner.users.invite({ email: 'dorj@acme.mn', fullName: 'Dorj' });

    const first = await owner.users.list({ limit: 2 });

    const next = await owner.users.list({
      limit: 2,
      cursor: first.pageInfo.endCursor ?? undefined,
    });

    const back = await owner.users.list({
      limit: 2,
      direction: 'backward',
      cursor: next.pageInfo.startCursor ?? undefined,
    });

    const search = await owner.users.list({ search: 'dorj' });
    const other = await otherOrg.users.list({});

    expect(first.totalCount).toBe(3);
    expect(first.data.map((user) => user.email)).toEqual(['dorj@acme.mn', 'bat@acme.mn']);
    expect(first.pageInfo).toMatchObject({ hasNextPage: true, hasPreviousPage: false });
    expect(next.data.map((user) => user.email)).toEqual(['owner@acme.mn']);
    expect(next.pageInfo).toMatchObject({ hasNextPage: false, hasPreviousPage: true });
    expect(back.data).toEqual(first.data);
    expect(back.pageInfo).toMatchObject({ hasNextPage: true, hasPreviousPage: false });
    expect(search.data.map((user) => user.email)).toEqual(['dorj@acme.mn']);
    expect(other.data.map((user) => user.email)).toEqual(['owner@globex.mn']);
  });

  it('hides team members of other organisations', async () => {
    await expect(otherOrg.users.get({ id: ownerId })).rejects.toMatchObject({ status: 404 });
  });

  it('lets members edit their own profile but not others or roles', async () => {
    const created = await owner.users.invite({ email: 'member@acme.mn' });
    const other = await owner.users.invite({ email: 'other@acme.mn' });

    // Activate the member so their token is accepted (sign-in comes in the next slice)
    await owner.users.disable({ id: created.id });
    await activate(created.id, 'set');

    const member = memberClient(created.id);

    expect(await member.users.update({ id: created.id, fullName: 'Member One' })).toMatchObject({
      fullName: 'Member One',
    });
    await expect(member.users.update({ id: other.id, fullName: 'Hacked' })).rejects.toMatchObject({
      status: 403,
    });
    await expect(member.users.update({ id: created.id, role: 'admin' })).rejects.toMatchObject({
      code: 'OWN_ROLE',
    });
    await expect(member.users.invite({ email: 'x@acme.mn' })).rejects.toMatchObject({
      status: 403,
    });
  });

  it('never leaves an organisation without an active owner', async () => {
    await expect(owner.users.disable({ id: ownerId })).rejects.toMatchObject({
      code: 'OWN_ACCOUNT',
    });
    await expect(owner.users.update({ id: ownerId, role: 'member' })).rejects.toMatchObject({
      code: 'OWN_ROLE',
    });
  });

  it('only owners change owner rights', async () => {
    const adminId = firstId(await owner.users.list({ search: 'bat' }));

    await activate(adminId);

    const admin = memberClient(adminId);
    const promote = await admin.users.invite({ email: 'new-admin@acme.mn', role: 'admin' });

    expect(promote.role).toBe('admin');
    await expect(admin.users.disable({ id: ownerId })).rejects.toMatchObject({
      code: 'OWNER_ONLY',
    });
    await expect(admin.users.update({ id: promote.id, role: 'owner' })).rejects.toMatchObject({
      code: 'OWNER_ONLY',
    });
  });

  it('disables and re-enables a member; a disabled member is signed out', async () => {
    const created = await owner.users.invite({ email: 'temp@acme.mn' });

    await activate(created.id, 'set');

    const temp = memberClient(created.id);

    await expect(temp.users.list({})).resolves.toHaveProperty('data');
    expect((await owner.users.disable({ id: created.id })).status).toBe('disabled');
    await expect(temp.users.list({})).rejects.toMatchObject({ status: 401 });
    expect((await owner.users.enable({ id: created.id })).status).toBe('active');
    await expect(temp.users.list({})).resolves.toHaveProperty('data');
  });

  it('keeps an invited member invited when re-enabled', async () => {
    const created = await owner.users.invite({ email: 'pending@acme.mn' });

    await owner.users.disable({ id: created.id });

    expect((await owner.users.enable({ id: created.id })).status).toBe('invited');
  });

  it('keeps profile details, and the full name in step with the name parts', async () => {
    const details = await owner.users.update({
      id: ownerId,
      firstName: 'Bold',
      lastName: 'Baatar',
      employeeId: 'E-001',
      birthDate: '1990-01-02',
      workStartedDate: '2024-05-01',
      phone: '+976 9911 2233',
      links: { website: 'erxes.io', github: 'erxes' },
    });

    expect(details).toMatchObject({
      fullName: 'Bold Baatar',
      firstName: 'Bold',
      lastName: 'Baatar',
      employeeId: 'E-001',
      birthDate: '1990-01-02',
      links: { website: 'erxes.io', github: 'erxes' },
    });

    const links = await owner.users.update({
      id: ownerId,
      links: { website: null },
      employeeId: '',
    });

    expect(links.links).toEqual({ github: 'erxes' });
    expect(links.employeeId).toBeNull();

    // A full name alone (older clients, the user menu) splits into first and last name.
    const full = await owner.users.update({ id: ownerId, fullName: 'Owner Of Acme' });
    expect(full).toMatchObject({ firstName: 'Owner', middleName: null, lastName: 'Of Acme' });

    const dorj = await owner.users.get({
      id: firstId(await owner.users.list({ search: 'dorj' })),
    });

    expect(dorj).toMatchObject({ fullName: 'Dorj', firstName: 'Dorj', lastName: null });

    await owner.users.update({ id: dorj.id, employeeId: 'E-777' });
    const byEmployeeId = await owner.users.list({ search: 'E-777' });
    expect(byEmployeeId.data.map((user) => user.email)).toEqual(['dorj@acme.mn']);

    await expect(
      owner.users.update({ id: ownerId, birthDate: '02/01/1990' }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });
  });

  it('invites several members at once, all or none', async () => {
    const created = await owner.users.inviteMany({
      entries: [
        { email: 'Many1@acme.mn' },
        { email: 'many2@acme.mn', role: 'admin', password: 'Secret-pass-1' },
      ],
    });

    expect(created.data.map(({ email, status, role }) => ({ email, status, role }))).toEqual([
      { email: 'many1@acme.mn', status: 'invited', role: 'member' },
      { email: 'many2@acme.mn', status: 'active', role: 'admin' },
    ]);
    expect(created.data[1]).not.toHaveProperty('passwordHash');
    // Invited with a password: they can sign in at once.
    expect((await signInAs('many2@acme.mn', 'Secret-pass-1')).user.email).toBe('many2@acme.mn');
    await expect(signInAs('many1@acme.mn', 'Secret-pass-1')).rejects.toMatchObject({
      status: 401,
    });

    await expect(
      owner.users.inviteMany({ entries: [{ email: 'MANY1@acme.mn' }, { email: 'many3@acme.mn' }] }),
    ).rejects.toMatchObject({
      status: 409,
      code: 'EMAIL_TAKEN',
      data: { emails: ['many1@acme.mn'] },
    });
    expect((await owner.users.list({ search: 'many3' })).totalCount).toBe(0);

    await expect(
      owner.users.inviteMany({ entries: [{ email: 'many4@acme.mn' }, { email: 'Many4@acme.mn' }] }),
    ).rejects.toMatchObject({ code: 'EMAIL_TAKEN' });
    await expect(
      owner.users.inviteMany({ entries: [{ email: 'many5@acme.mn', password: 'short' }] }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });

    const member = await clientOf('member@acme.mn');

    await expect(
      member.users.inviteMany({ entries: [{ email: 'many6@acme.mn' }] }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('lists active or disabled members', async () => {
    const created = await owner.users.invite({ email: 'gone@acme.mn' });

    await owner.users.disable({ id: created.id });

    const active = await owner.users.list({ isActive: true, limit: 100 });
    const disabled = await owner.users.list({ isActive: false, limit: 100 });

    expect(active.data.every((user) => user.status !== 'disabled')).toBe(true);
    expect(active.data.map((user) => user.email)).not.toContain('gone@acme.mn');
    expect(disabled.data.map((user) => user.email)).toEqual(['gone@acme.mn']);
  });

  it('sets a member password (owners and admins; owners only for owners; never their own)', async () => {
    const created = await owner.users.invite({ email: 'reset@acme.mn' });
    const reset = await owner.users.setPassword({ id: created.id, password: 'Reset-pass-1' });

    expect(reset.status).toBe('active');
    expect(reset).not.toHaveProperty('passwordHash');
    expect((await signInAs('reset@acme.mn', 'Reset-pass-1')).user.email).toBe('reset@acme.mn');

    await expect(
      owner.users.setPassword({ id: ownerId, password: 'Reset-pass-1' }),
    ).rejects.toMatchObject({ code: 'OWN_ACCOUNT' });
    await expect(
      owner.users.setPassword({ id: created.id, password: 'weak' }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });

    const admin = await clientOf('bat@acme.mn');

    await expect(
      admin.users.setPassword({ id: ownerId, password: 'Reset-pass-1' }),
    ).rejects.toMatchObject({ code: 'OWNER_ONLY' });
    expect((await admin.users.setPassword({ id: created.id, password: 'Reset-pass-2' })).id).toBe(
      created.id,
    );

    const member = await clientOf('member@acme.mn');

    await expect(
      member.users.setPassword({ id: created.id, password: 'Reset-pass-3' }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('changes emails: unique in the organisation, owners only for an owner', async () => {
    const created = await owner.users.invite({ email: 'rename@acme.mn' });
    const renamed = await owner.users.update({ id: created.id, email: ' Renamed@Acme.mn ' });

    expect(renamed.email).toBe('renamed@acme.mn');
    await expect(
      owner.users.update({ id: created.id, email: 'bat@acme.mn' }),
    ).rejects.toMatchObject({ status: 409, code: 'EMAIL_TAKEN' });

    const admin = await clientOf('bat@acme.mn');

    await expect(admin.users.update({ id: ownerId, email: 'mine@acme.mn' })).rejects.toMatchObject({
      code: 'OWNER_ONLY',
    });
    expect((await admin.users.update({ id: created.id, email: 'renamed2@acme.mn' })).email).toBe(
      'renamed2@acme.mn',
    );
  });
});
