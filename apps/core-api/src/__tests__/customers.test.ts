import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, expect, it } from 'vitest';
import { createApp } from '~/app';
import { signAccessToken } from '~/http/auth';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { describeWithDb, useTestDatabase } from './db';

describeWithDb('customers (/core/v1/customers)', () => {
  useTestDatabase();

  let server: Server;
  let base = '';
  let ownerToken = '';
  let ownerId = '';
  let memberToken = '';
  let otherOrgToken = '';
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
    ownerToken = signAccessToken(acme.owner.id, acme.organization.id);
    memberToken = signAccessToken(memberId, acme.organization.id);
    otherOrgToken = signAccessToken(globex.owner.id, globex.organization.id);

    server = createApp().listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

  interface CustomerBody {
    id: string;
    state: string;
    firstName: string | null;
    primaryEmail: string | null;
    emails: string[];
    primaryPhone: string | null;
    phones: string[];
    ownerId: string | null;
  }

  /** Every field a test reads from a core response (success or error). */
  interface Body extends CustomerBody {
    code: string;
    data: CustomerBody[];
    pageInfo: { hasNextPage: boolean; hasPreviousPage: boolean; endCursor: string | null };
    totalCount: number;
    removed: number;
  }

  /** `data` of an error body (oRPC: `{ code, status, message, data }`). */
  const errorData = (body: unknown) => (body as { data?: { field: string; id: string | null } }).data;

  const call = async (
    token: string,
    path: string,
    init: RequestInit = {},
  ): Promise<{ status: number; body: Body }> => {
    const response = await fetch(`${base}/core/v1${path}`, {
      ...init,
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
      },
    });

    return { status: response.status, body: (await response.json()) as Body };
  };

  const create = (token: string, body: Record<string, unknown>) =>
    call(token, '/customers', { method: 'POST', body: JSON.stringify(body) });

  const update = (token: string, id: string, body: Record<string, unknown>) =>
    call(token, `/customers/${id}`, { method: 'PATCH', body: JSON.stringify(body) });

  it('creates a customer with normalised contacts, primary first', async () => {
    const { status, body } = await create(memberToken, {
      firstName: 'Saraa',
      primaryEmail: 'Saraa@Mail.MN',
      emails: ['saraa@work.mn', 'saraa@mail.mn'],
      phones: ['+976 (9911) 22-33'],
    });

    expect(status).toBe(201);
    expect(body).toMatchObject({
      state: 'customer',
      firstName: 'Saraa',
      primaryEmail: 'saraa@mail.mn',
      emails: ['saraa@mail.mn', 'saraa@work.mn'],
      primaryPhone: '+97699112233',
      phones: ['+97699112233'],
    });
  });

  it('needs a name, an email or a phone', async () => {
    const { status, body } = await create(ownerToken, { description: 'nobody' });

    expect(status).toBe(400);
    expect(body.code).toBe('INVALID_INPUT');
  });

  it('refuses a taken primary email or phone and names the existing customer', async () => {
    const existing = await create(ownerToken, { firstName: 'Bold', primaryPhone: '99001122' });
    const byEmail = await create(ownerToken, { primaryEmail: 'SARAA@mail.mn' });
    const byPhone = await create(ownerToken, { phones: ['9900 1122'] });

    expect(byEmail.status).toBe(409);
    expect(byEmail.body.code).toBe('CUSTOMER_EXISTS');
    expect(errorData(byEmail.body)?.field).toBe('primaryEmail');
    expect(byPhone.status).toBe(409);
    expect(errorData(byPhone.body)).toEqual({ field: 'primaryPhone', id: existing.body.id });
  });

  it('keeps customers of other organisations apart', async () => {
    const theirs = await create(otherOrgToken, { primaryEmail: 'saraa@mail.mn' });
    const list = await call(otherOrgToken, '/customers');

    expect(theirs.status).toBe(201);
    expect(list.body.data.map((customer) => customer.id)).toEqual([theirs.body.id]);
    expect((await call(ownerToken, `/customers/${theirs.body.id}`)).status).toBe(404);
    expect((await update(ownerToken, theirs.body.id, { firstName: 'x' })).status).toBe(404);
  });

  it('updates contacts: a removed primary is replaced by the next one', async () => {
    const created = await create(ownerToken, {
      firstName: 'Tuul',
      emails: ['tuul@a.mn', 'tuul@b.mn'],
    });

    const dropped = await update(ownerToken, created.body.id, { primaryEmail: null });
    expect(dropped.body).toMatchObject({ primaryEmail: 'tuul@b.mn', emails: ['tuul@b.mn'] });

    const listed = await update(ownerToken, created.body.id, {
      emails: ['tuul@c.mn', 'tuul@b.mn'],
    });
    expect(listed.body).toMatchObject({
      primaryEmail: 'tuul@b.mn',
      emails: ['tuul@b.mn', 'tuul@c.mn'],
    });

    const renamed = await update(ownerToken, created.body.id, { state: 'lead' });
    expect(renamed.body).toMatchObject({ state: 'lead', firstName: 'Tuul', primaryEmail: 'tuul@b.mn' });
  });

  it('accepts only team members of the organisation as owner', async () => {
    const created = await create(ownerToken, { firstName: 'Owned', ownerId });
    const foreign = await create(ownerToken, { firstName: 'Foreign', ownerId: otherOrgOwnerId });

    expect(created.body.ownerId).toBe(ownerId);
    expect(foreign.status).toBe(400);
    expect(foreign.body.code).toBe('INVALID_OWNER');
  });

  it('searches by name, email and phone, filters by state and pages by cursor', async () => {
    const byName = await call(ownerToken, '/customers?search=saraa');
    const byPhone = await call(ownerToken, '/customers?search=9900-11');
    const leads = await call(ownerToken, '/customers?state=lead');
    const first = await call(ownerToken, '/customers?limit=2');
    const rest = await call(ownerToken, `/customers?limit=10&cursor=${first.body.pageInfo.endCursor}`);
    const reopen = await call(
      ownerToken,
      `/customers?limit=10&cursorMode=inclusive&cursor=${first.body.pageInfo.endCursor}`,
    );

    expect(byName.body.data.map((customer) => customer.firstName)).toEqual(['Saraa']);
    expect(byPhone.body.data.map((customer) => customer.firstName)).toEqual(['Bold']);
    expect(leads.body.data.map((customer) => customer.firstName)).toEqual(['Tuul']);
    expect(first.body.totalCount).toBe(4);
    expect(first.body.pageInfo.hasNextPage).toBe(true);
    expect(rest.body.data).toHaveLength(2);
    expect(rest.body.pageInfo).toMatchObject({ hasNextPage: false, hasPreviousPage: true });
    expect(reopen.body.data[0]?.id).toBe(first.body.pageInfo.endCursor);
    expect(reopen.body.data).toHaveLength(3);
  });

  it('starts from the top when a remembered cursor is gone, and rejects it for paging', async () => {
    const reopen = await call(ownerToken, '/customers?cursorMode=inclusive&cursor=gone');
    const page = await call(ownerToken, '/customers?cursor=gone');

    expect(reopen.body.data).toHaveLength(4);
    expect(page.status).toBe(400);
    expect(page.body.code).toBe('INVALID_CURSOR');
  });

  it('lets only owners and admins delete customers', async () => {
    const created = await create(ownerToken, { firstName: 'Temp' });
    const asMember = await call(memberToken, '/customers/remove', {
      method: 'POST',
      body: JSON.stringify({ ids: [created.body.id] }),
    });
    const asOwner = await call(ownerToken, '/customers/remove', {
      method: 'POST',
      body: JSON.stringify({ ids: [created.body.id, 'missing'] }),
    });

    expect(asMember.status).toBe(403);
    expect(asOwner.body.removed).toBe(1);
    expect((await call(ownerToken, `/customers/${created.body.id}`)).status).toBe(404);
  });
});
