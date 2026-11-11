import { beforeAll, expect, it } from 'vite-plus/test';
import { signAccessToken } from '~/http/auth';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { describeWithDb, useTestDatabase, useTestServer } from './support';

describeWithDb('customers (/core/v1/customers)', () => {
  useTestDatabase();

  const server = useTestServer();
  let owner = server.client();
  let member = server.client();
  let otherOrg = server.client();
  let ownerId = '';
  let otherOrgOwnerId = '';

  beforeAll(async () => {
    const { db, users, newId } = await import('@erxes/core-db');

    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'owner@acme.mn' },
    });

    const globex = await createOrganization({
      subdomain: 'globex',
      name: 'Globex',
      owner: { email: 'owner@globex.mn' },
    });

    const memberId = newId();

    await db().insert(users).values({
      id: memberId,
      orgId: acme.organization.id,
      email: 'member@acme.mn',
      role: 'member',
      status: 'active',
    });

    ownerId = acme.owner.id;
    otherOrgOwnerId = globex.owner.id;
    owner = server.client(signAccessToken(acme.owner.id, acme.organization.id));
    member = server.client(signAccessToken(memberId, acme.organization.id));
    otherOrg = server.client(signAccessToken(globex.owner.id, globex.organization.id));
  });

  it('creates a customer with normalised contacts, primary first', async () => {
    const created = await member.customers.create({
      firstName: 'Saraa',
      primaryEmail: 'Saraa@Mail.MN',
      emails: ['saraa@work.mn', 'saraa@mail.mn'],
      phones: ['+976 (9911) 22-33'],
    });

    expect(server.status()).toBe(201);
    expect(created).toMatchObject({
      state: 'customer',
      firstName: 'Saraa',
      primaryEmail: 'saraa@mail.mn',
      emails: ['saraa@mail.mn', 'saraa@work.mn'],
      primaryPhone: '+97699112233',
      phones: ['+97699112233'],
    });
  });

  it('needs a name, an email or a phone', async () => {
    await expect(owner.customers.create({ description: 'nobody' })).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_INPUT',
    });
  });

  it('refuses a taken primary email or phone and names the existing customer', async () => {
    const existing = await owner.customers.create({ firstName: 'Bold', primaryPhone: '99001122' });

    await expect(owner.customers.create({ primaryEmail: 'SARAA@mail.mn' })).rejects.toMatchObject({
      status: 409,
      code: 'CUSTOMER_EXISTS',
      data: { field: 'primaryEmail' },
    });
    await expect(owner.customers.create({ phones: ['9900 1122'] })).rejects.toMatchObject({
      status: 409,
      data: { field: 'primaryPhone', id: existing.id },
    });
  });

  it('keeps customers of other organisations apart', async () => {
    const theirs = await otherOrg.customers.create({ primaryEmail: 'saraa@mail.mn' });
    const list = await otherOrg.customers.list({});

    expect(list.data.map((customer) => customer.id)).toEqual([theirs.id]);
    await expect(owner.customers.get({ id: theirs.id })).rejects.toMatchObject({ status: 404 });
    await expect(owner.customers.update({ id: theirs.id, firstName: 'x' })).rejects.toMatchObject({
      status: 404,
    });
  });

  it('updates contacts: a removed primary is replaced by the next one', async () => {
    const created = await owner.customers.create({
      firstName: 'Tuul',
      emails: ['tuul@a.mn', 'tuul@b.mn'],
    });

    const dropped = await owner.customers.update({ id: created.id, primaryEmail: null });
    expect(dropped).toMatchObject({ primaryEmail: 'tuul@b.mn', emails: ['tuul@b.mn'] });

    const listed = await owner.customers.update({
      id: created.id,
      emails: ['tuul@c.mn', 'tuul@b.mn'],
    });

    expect(listed).toMatchObject({
      primaryEmail: 'tuul@b.mn',
      emails: ['tuul@b.mn', 'tuul@c.mn'],
    });

    const renamed = await owner.customers.update({ id: created.id, state: 'lead' });
    expect(renamed).toMatchObject({
      state: 'lead',
      firstName: 'Tuul',
      primaryEmail: 'tuul@b.mn',
    });
  });

  it('accepts only team members of the organisation as owner', async () => {
    const created = await owner.customers.create({ firstName: 'Owned', ownerId });

    expect(created.ownerId).toBe(ownerId);
    await expect(
      owner.customers.create({ firstName: 'Foreign', ownerId: otherOrgOwnerId }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_OWNER' });
  });

  it('searches by name, email and phone, filters by state and pages by cursor', async () => {
    const byName = await owner.customers.list({ search: 'saraa' });
    const byPhone = await owner.customers.list({ search: '9900-11' });
    const leads = await owner.customers.list({ state: 'lead' });
    const first = await owner.customers.list({ limit: 2 });
    const cursor = first.pageInfo.endCursor ?? undefined;
    const rest = await owner.customers.list({ limit: 10, cursor });
    const reopen = await owner.customers.list({ limit: 10, cursorMode: 'inclusive', cursor });

    expect(byName.data.map((customer) => customer.firstName)).toEqual(['Saraa']);
    expect(byPhone.data.map((customer) => customer.firstName)).toEqual(['Bold']);
    expect(leads.data.map((customer) => customer.firstName)).toEqual(['Tuul']);
    expect(first.totalCount).toBe(4);
    expect(first.pageInfo.hasNextPage).toBe(true);
    expect(cursor).toBeDefined();
    expect(rest.data).toHaveLength(2);
    expect(rest.pageInfo).toMatchObject({ hasNextPage: false, hasPreviousPage: true });
    expect(reopen.data[0]?.id).toBe(cursor);
    expect(reopen.data).toHaveLength(3);
  });

  it('starts from the top when a remembered cursor is gone, and rejects it for paging', async () => {
    const reopen = await owner.customers.list({ cursorMode: 'inclusive', cursor: 'gone' });

    expect(reopen.data).toHaveLength(4);
    await expect(owner.customers.list({ cursor: 'gone' })).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_CURSOR',
    });
  });

  it('lets only owners and admins delete customers', async () => {
    const created = await owner.customers.create({ firstName: 'Temp' });

    await expect(member.customers.remove({ ids: [created.id] })).rejects.toMatchObject({
      status: 403,
    });
    expect((await owner.customers.remove({ ids: [created.id, 'missing'] })).removed).toBe(1);
    expect(server.status()).toBe(200);
    await expect(owner.customers.get({ id: created.id })).rejects.toMatchObject({ status: 404 });
  });
});
