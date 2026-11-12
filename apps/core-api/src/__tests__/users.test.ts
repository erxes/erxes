import { users } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { beforeAll, expect, it } from 'vite-plus/test';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { adminDb, currentToken, describeWithDb, useTestDatabase } from './db';
import { type CoreClient, useTestServer } from './support';

const emails = (page: { data: { email: string }[] }) => page.data.map((user) => user.email);

/** Makes an invited member active, as accepting the invitation would. */
const activate = (id: string) =>
  adminDb().update(users).set({ status: 'active', passwordHash: 'set' }).where(eq(users.id, id));

describeWithDb('team members (/core/v1/users)', () => {
  useTestDatabase();

  const server = useTestServer();
  const ids = { org: '', owner: '' };
  let owner: CoreClient;
  let other: CoreClient;

  const as = (user: string) => server.client({ user, org: ids.org });

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

    Object.assign(ids, { org: acme.organization.id, owner: acme.owner.id });
    owner = as(acme.owner.id);
    other = server.client({ user: globex.owner.id, org: globex.organization.id });
  });

  it('refuses requests without a valid token', async () => {
    await expect(server.client().users.list({})).rejects.toMatchObject({ status: 401 });
    await expect(server.client('not-a-token').users.list({})).rejects.toMatchObject({
      status: 401,
    });
  });

  it('returns the current organisation', async () => {
    expect(await owner.organizations.current({})).toMatchObject({
      subdomain: 'acme',
      name: 'Acme',
    });
  });

  it('invites a member with a lowercased email and never returns credentials', async () => {
    const invited = await owner.users.invite({
      email: ' Bat@Acme.MN ',
      fullName: 'Bat',
      role: 'admin',
    });

    expect(invited).toMatchObject({ email: 'bat@acme.mn', role: 'admin', status: 'invited' });
    expect(invited).not.toHaveProperty('passwordHash');
    expect(invited).not.toHaveProperty('orgId');
  });

  it('refuses a second member with the same email (any case), and input the contract refuses', async () => {
    await expect(owner.users.invite({ email: 'BAT@acme.mn' })).rejects.toMatchObject({
      status: 409,
      code: 'EMAIL_TAKEN',
    });
    await expect(
      owner.users.invite({ email: 'not-an-email', role: 'owner' }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });
  });

  it('lists, searches and pages team members of the caller organisation only', async () => {
    await owner.users.invite({ email: 'dorj@acme.mn', fullName: 'Dorj' });

    const first = await owner.users.list({ limit: 2 });
    const next = await owner.users.list({ limit: 2, cursor: first.pageInfo.endCursor ?? '' });

    const back = await owner.users.list({
      limit: 2,
      direction: 'backward',
      cursor: next.pageInfo.startCursor ?? '',
    });

    expect(first.totalCount).toBe(3);
    expect(emails(first)).toEqual(['dorj@acme.mn', 'bat@acme.mn']);
    expect(first.pageInfo).toMatchObject({ hasNextPage: true, hasPreviousPage: false });
    expect(emails(next)).toEqual(['owner@acme.mn']);
    expect(next.pageInfo).toMatchObject({ hasNextPage: false, hasPreviousPage: true });
    expect(back.data).toEqual(first.data);
    expect(back.pageInfo).toMatchObject({ hasNextPage: true, hasPreviousPage: false });
    expect(emails(await owner.users.list({ search: 'dorj' }))).toEqual(['dorj@acme.mn']);
    expect(emails(await other.users.list({}))).toEqual(['owner@globex.mn']);
  });

  it('hides team members of other organisations', async () => {
    await expect(other.users.get({ id: ids.owner })).rejects.toMatchObject({ status: 404 });
  });

  it('lets members edit their own profile but not others or roles', async () => {
    const { id } = await owner.users.invite({ email: 'member@acme.mn' });
    const someoneElse = await owner.users.invite({ email: 'other@acme.mn' });

    await activate(id);

    const member = as(id);

    expect(await member.users.update({ id, fullName: 'Member One' })).toMatchObject({
      fullName: 'Member One',
    });
    await expect(
      member.users.update({ id: someoneElse.id, fullName: 'Hacked' }),
    ).rejects.toMatchObject({ status: 403 });
    await expect(member.users.update({ id, role: 'admin' })).rejects.toMatchObject({
      code: 'OWN_ROLE',
    });
    await expect(member.users.invite({ email: 'x@acme.mn' })).rejects.toMatchObject({
      status: 403,
    });
  });

  it('never leaves an organisation without an active owner', async () => {
    await expect(owner.users.disable({ id: ids.owner })).rejects.toMatchObject({
      code: 'OWN_ACCOUNT',
    });
    await expect(owner.users.update({ id: ids.owner, role: 'member' })).rejects.toMatchObject({
      code: 'OWN_ROLE',
    });
  });

  it('only owners change owner rights', async () => {
    const [bat] = (await owner.users.list({ search: 'bat' })).data;

    await activate(bat?.id ?? '');

    const admin = as(bat?.id ?? '');
    const promoted = await admin.users.invite({ email: 'new-admin@acme.mn', role: 'admin' });

    await expect(admin.users.disable({ id: ids.owner })).rejects.toMatchObject({
      code: 'OWNER_ONLY',
    });
    await expect(admin.users.update({ id: promoted.id, role: 'owner' })).rejects.toMatchObject({
      code: 'OWNER_ONLY',
    });
  });

  it('disables and re-enables a member; a disabled member is signed out', async () => {
    const { id } = await owner.users.invite({ email: 'temp@acme.mn' });

    await activate(id);

    const before = server.client(await currentToken(id, ids.org));

    expect((await before.users.list({})).totalCount).toBeGreaterThan(0);
    expect((await owner.users.disable({ id })).status).toBe('disabled');
    await expect(before.users.list({})).rejects.toMatchObject({ status: 401 });
    expect((await owner.users.enable({ id })).status).toBe('active');
    // Enabling doesn't bring old sessions back; a new sign-in works.
    await expect(before.users.list({})).rejects.toMatchObject({ status: 401 });
    expect((await as(id).users.list({})).totalCount).toBeGreaterThan(0);
  });

  it('keeps an invited member invited when re-enabled', async () => {
    const { id } = await owner.users.invite({ email: 'pending@acme.mn' });

    await owner.users.disable({ id });
    expect((await owner.users.enable({ id })).status).toBe('invited');
  });
});
