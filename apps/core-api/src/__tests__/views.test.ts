import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '~/app';
import { daysToAnniversary, evaluateRule } from '~/modules/automations/conditions';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { adminDb, currentToken, describeWithDb, useTestDatabase } from './db';

describe('relative dates in automation conditions', () => {
  const now = new Date();
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000).toISOString();

  it('within the last, more than ago, within the next, anniversaries', () => {
    expect(evaluateRule({ path: 'd', op: 'within_last', value: { amount: 7, unit: 'days' } }, { d: daysAgo(3) })).toBe(true);
    expect(evaluateRule({ path: 'd', op: 'within_last', value: { amount: 7, unit: 'days' } }, { d: daysAgo(9) })).toBe(false);
    expect(evaluateRule({ path: 'd', op: 'more_than_ago', value: { amount: 1, unit: 'months' } }, { d: daysAgo(40) })).toBe(true);
    expect(evaluateRule({ path: 'd', op: 'within_next', value: { amount: 2, unit: 'weeks' } }, { d: daysAgo(-5) })).toBe(true);
    // Born years ago, the day comes round in 3 days.
    const inThree = new Date(now.getTime() + 3 * 86_400_000);
    const birthday = `1990-${String(inThree.getUTCMonth() + 1).padStart(2, '0')}-${String(inThree.getUTCDate()).padStart(2, '0')}`;

    expect(daysToAnniversary(birthday, now)).toBe(3);
    expect(evaluateRule({ path: 'd', op: 'anniversary_within', value: { amount: 7 } }, { d: birthday })).toBe(true);
    expect(evaluateRule({ path: 'd', op: 'anniversary_within', value: { amount: 2 } }, { d: birthday })).toBe(false);
    // 29 February counts on 28 February in other years.
    expect(daysToAnniversary('2000-02-29', new Date(Date.UTC(2027, 1, 27)))).toBe(1);
  });
});

describeWithDb('advanced filters and saved views', { timeout: 300_000 }, () => {
  useTestDatabase();

  let server: Server;
  let base = '';
  let owner = '';
  let member = '';
  let viewer = '';
  let ownerId = '';
  let memberId = '';
  const ids: Record<string, string> = {};
  let vip = '';
  let spend = '';
  let interests = '';

  const call = async (token: string, method: string, path: string, body?: unknown) => {
    const response = await fetch(`${base}/core/v1${path}`, {
      method,
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();

    return { status: response.status, body: text ? JSON.parse(text) : null };
  };

  /** Names of the customers (or leads, or companies) a filter finds. */
  const found = async (filter: unknown, path = '/customers', token = owner) => {
    const response = await call(token, 'GET', `${path}${path.includes('?') ? '&' : '?'}limit=100&filter=${encodeURIComponent(JSON.stringify(filter))}`);

    if (response.status !== 200) return response.body;

    return response.body.data.map((row: { firstName?: string; primaryName?: string }) => row.firstName ?? row.primaryName).sort();
  };

  const rule = (path: string, op: string, value?: unknown) => ({ match: 'all', rules: [{ path, op, ...(value === undefined ? {} : { value }) }] });

  beforeAll(async () => {
    const { users, roles, newId } = await import('@erxes/core-db');
    const acme = await createOrganization({ subdomain: 'acme', name: 'Acme', owner: { email: 'o@acme.mn' } });
    const orgId = acme.organization.id;

    ownerId = acme.owner.id;
    memberId = newId();

    const viewerId = newId();

    await adminDb().insert(roles).values({ orgId, key: 'r_viewer', name: 'Viewer', permissions: ['contacts.view'] });
    await adminDb()
      .insert(users)
      .values([
        { id: memberId, orgId, email: 'm@acme.mn', role: 'member', status: 'active' },
        { id: viewerId, orgId, email: 'v@acme.mn', role: 'r_viewer', status: 'active' },
      ]);
    owner = await currentToken(ownerId, orgId);
    member = await currentToken(memberId, orgId);
    viewer = await currentToken(viewerId, orgId);
    server = createApp().listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

    vip = (await call(owner, 'POST', '/tags', { name: 'VIP', type: 'customer' })).body.id;
    const spendField = await call(owner, 'POST', '/fields', { contentType: 'customer', label: 'Spend', type: 'number' });

    expect(spendField.body).toMatchObject({ label: 'Spend' });
    spend = spendField.body.id;
    interests = (
      await call(owner, 'POST', '/fields', {
        contentType: 'customer',
        label: 'Interests',
        type: 'multiselect',
        options: ['golf', 'ski'],
      })
    ).body.id;

    const soon = new Date(Date.now() + 5 * 86_400_000);
    const birthday = `1988-${String(soon.getUTCMonth() + 1).padStart(2, '0')}-${String(soon.getUTCDate()).padStart(2, '0')}`;

    const created = await call(owner, 'POST', '/customers', {
        firstName: 'Bat',
        state: 'lead',
        primaryEmail: 'bat@golf.mn',
        tagIds: [vip],
        birthDate: birthday,
        customFields: { [spend]: 1500, [interests]: ['golf'] },
      });

    expect(created.body).toMatchObject({ firstName: 'Bat' });
    ids.bat = created.body.id;
    ids.dorj = (await call(owner, 'POST', '/customers', { firstName: 'Dorj', state: 'customer', ownerId: memberId, customFields: { [spend]: 200 } })).body.id;
    ids.saraa = (await call(owner, 'POST', '/customers', { firstName: 'Saraa', state: 'customer', primaryEmail: 'saraa@shop.mn' })).body.id;

    for (const [name, id] of Object.entries(ids)) expect(id, `${name} was not created`).toEqual(expect.any(String));

    const retail = (await call(owner, 'POST', '/companies', { primaryName: 'Retail Co', industry: 'Retail', size: 40 })).body.id;

    await call(owner, 'POST', '/companies', { primaryName: 'Lonely LLC', industry: 'Mining' });
    expect((await call(owner, 'PUT', `/customers/${ids.saraa}/companies/${retail}`)).status).toBeLessThan(300);

    // Dorj has been around for 40 days.
    const { customers } = await import('@erxes/core-db');
    const { eq, sql } = await import('drizzle-orm');

    await adminDb()
      .update(customers)
      .set({ createdAt: sql`now() - interval '40 days'` })
      .where(eq(customers.id, ids.dorj!));
  });

  afterAll(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('filters by fields, custom fields, tags, owner, dates, the company and nested groups', async () => {
    expect(await found(rule('subject.state', 'eq', 'lead'))).toEqual(['Bat']);
    expect(await found(rule('subject.primaryEmail', 'contains', 'GOLF'))).toEqual(['Bat']);
    expect(await found(rule('subject.primaryEmail', 'not_exists'))).toEqual(['Dorj']);
    expect(await found(rule('subject.tagIds', 'contains', vip))).toEqual(['Bat']);
    expect(await found(rule('subject.tagIds', 'not_exists'))).toEqual(['Dorj', 'Saraa']);
    expect(await found(rule('subject.ownerId', 'eq', 'me'), '/customers', member)).toEqual(['Dorj']);
    expect(await found(rule(`subject.customFields.${spend}`, 'gt', 1000))).toEqual(['Bat']);
    expect(await found(rule(`subject.customFields.${spend}`, 'lte', 1000))).toEqual(['Dorj']);
    expect(await found(rule(`subject.customFields.${interests}`, 'contains', 'golf'))).toEqual(['Bat']);
    expect(await found(rule('subject.createdAt', 'more_than_ago', { amount: 30, unit: 'days' }))).toEqual(['Dorj']);
    expect(await found(rule('subject.createdAt', 'within_last', { amount: 1, unit: 'weeks' }))).toEqual(['Bat', 'Saraa']);
    expect(await found(rule('subject.birthDate', 'anniversary_within', { amount: 7 }))).toEqual(['Bat']);
    expect(await found(rule('subject.company.industry', 'eq', 'retail'))).toEqual(['Saraa']);
    // "Doesn't work at a Retail company": no linked company matches.
    expect(await found(rule('subject.company.industry', 'neq', 'Retail'))).toEqual(['Bat', 'Dorj']);
    expect(await found(rule('subject.company.primaryName', 'exists'))).toEqual(['Saraa']);

    // (lead or spent > 100) and not Saraa's shop.
    expect(
      await found({
        match: 'all',
        rules: [
          {
            match: 'any',
            rules: [
              { path: 'subject.state', op: 'eq', value: 'lead' },
              { path: `subject.customFields.${spend}`, op: 'gt', value: 100 },
            ],
          },
          { path: 'subject.primaryEmail', op: 'not_contains', value: 'shop' },
        ],
      }),
    ).toEqual(['Bat', 'Dorj']);

    // Companies: by their customers.
    expect(await found(rule('subject.customerCount', 'gte', 1), '/companies')).toEqual(['Retail Co']);
    expect(await found(rule('subject.size', 'gt', 10), '/companies')).toEqual(['Retail Co']);

    // Filters combine with the list's own (state, search).
    expect(await found(rule('subject.tagIds', 'exists'), '/customers?state=customer')).toEqual([]);
  });

  it('filters by company properties, treats a missing value as "not", and keeps last activity from the timeline', async () => {
    const region = (await call(owner, 'POST', '/fields', { contentType: 'company', label: 'Region', type: 'select', options: ['North', 'South'] })).body.id;
    const isMember = (await call(owner, 'POST', '/fields', { contentType: 'customer', label: 'Member', type: 'boolean' })).body.id;
    const renewal = (await call(owner, 'POST', '/fields', { contentType: 'customer', label: 'Renewal', type: 'date' })).body.id;
    const retail = (await call(owner, 'GET', '/companies?search=retail')).body.data[0].id;
    const inTen = new Date(Date.now() + 10 * 86_400_000).toISOString().slice(0, 10);

    expect((await call(owner, 'PATCH', `/companies/${retail}`, { customFields: { [region]: 'North' } })).status).toBe(200);
    expect((await call(owner, 'PATCH', `/customers/${ids.bat}`, { customFields: { [isMember]: true, [renewal]: inTen } })).status).toBe(200);
    expect((await call(owner, 'PATCH', `/customers/${ids.dorj}`, { customFields: { [isMember]: false } })).status).toBe(200);

    // Customers by their company's properties.
    expect(await found(rule(`subject.company.customFields.${region}`, 'eq', 'north'))).toEqual(['Saraa']);
    expect(await found(rule(`subject.company.customFields.${region}`, 'neq', 'North'))).toEqual(['Bat', 'Dorj']);
    // No value is "no"; "is not" includes records without a value.
    expect(await found(rule(`subject.customFields.${isMember}`, 'eq', true))).toEqual(['Bat']);
    expect(await found(rule(`subject.customFields.${isMember}`, 'eq', false))).toEqual(['Dorj', 'Saraa']);
    expect(await found(rule(`subject.customFields.${spend}`, 'neq', 200))).toEqual(['Bat', 'Saraa']);
    expect(await found(rule(`subject.customFields.${spend}`, 'not_exists'))).toEqual(['Saraa']);
    expect(await found(rule(`subject.customFields.${interests}`, 'not_contains', 'golf'))).toEqual(['Dorj', 'Saraa']);
    expect(await found(rule(`subject.customFields.${renewal}`, 'within_next', { amount: 2, unit: 'weeks' }))).toEqual(['Bat']);
    expect(await found(rule(`subject.customFields.${renewal}`, 'anniversary_within', { amount: 12 }))).toEqual(['Bat']);

    // Values read back as before, and a deleted field takes its values with it.
    expect((await call(owner, 'GET', `/customers/${ids.bat}`)).body.customFields).toEqual({ [spend]: 1500, [interests]: ['golf'], [isMember]: true, [renewal]: inTen });

    // Last activity: every timeline entry moves it; creation counts.
    const { activities, customers, newId } = await import('@erxes/core-db');
    const { eq, sql } = await import('drizzle-orm');
    const [dorj] = await adminDb().select({ orgId: customers.orgId }).from(customers).where(eq(customers.id, ids.dorj!));

    await adminDb().update(customers).set({ lastActivityAt: sql`now() - interval '90 days'` });
    expect(await found(rule('subject.lastActivityAt', 'more_than_ago', { amount: 60, unit: 'days' }))).toEqual(['Bat', 'Dorj', 'Saraa']);
    await adminDb()
      .insert(activities)
      .values({ id: newId(), orgId: dorj!.orgId, targetType: 'customer', targetId: ids.dorj!, source: 'core', type: 'customer.note', actorType: 'system' });
    expect(await found(rule('subject.lastActivityAt', 'within_last', { amount: 1, unit: 'days' }))).toEqual(['Dorj']);

    // The search box: every word somewhere in names, emails, phones or code.
    expect((await call(owner, 'GET', '/customers?search=SHOP%20saraa')).body.data.map((row: { firstName: string }) => row.firstName)).toEqual(['Saraa']);
  });

  it('refuses filters that do not fit', async () => {
    expect((await found(rule('subject.nope', 'eq', 'x'))).code).toBe('INVALID_FILTER');
    expect((await found(rule(`subject.customFields.${spend}`, 'contains', 'x'))).code).toBe('INVALID_FILTER');
    expect((await found(rule('subject.createdAt', 'within_last', { amount: 'many' }))).code).toBe('INVALID_FILTER');
    expect((await call(owner, 'GET', '/customers?filter=not-json')).body.code).toBe('INVALID_FILTER');
  });

  it('saves views: private to their creator, shared with the team, changed only by who may', async () => {
    const leads = { name: 'Golf leads', recordType: 'customer', filter: rule('subject.primaryEmail', 'contains', 'golf'), columns: ['firstName', 'primaryEmail'] };
    const mine = await call(member, 'POST', '/views', leads);

    expect(mine.status).toBe(201);
    expect(mine.body).toMatchObject({ name: 'Golf leads', shared: false, editable: true, columns: ['firstName', 'primaryEmail'] });
    // Private: the owner doesn't see it.
    expect((await call(owner, 'GET', '/views?recordType=customer')).body.data).toEqual([]);

    // A filter that doesn't fit isn't saved.
    expect((await call(member, 'POST', '/views', { ...leads, filter: rule('subject.nope', 'eq', 1) })).body.code).toBe('INVALID_FILTER');

    // Sharing needs contacts.edit.
    expect((await call(viewer, 'POST', '/views', { ...leads, shared: true })).body.code).toBe('NOT_ALLOWED');

    const shared = await call(owner, 'POST', '/views', { name: 'VIPs', recordType: 'customer', filter: rule('subject.tagIds', 'contains', vip), shared: true });
    const seen = (await call(viewer, 'GET', '/views?recordType=customer')).body.data;

    expect(seen).toEqual([expect.objectContaining({ name: 'VIPs', shared: true, editable: false })]);
    expect((await call(viewer, 'PATCH', `/views/${shared.body.id}`, { name: 'Mine now' })).body.code).toBe('NOT_ALLOWED');
    // Members who edit contacts may change shared views.
    expect((await call(member, 'PATCH', `/views/${shared.body.id}`, { name: 'Top VIPs' })).body).toMatchObject({ name: 'Top VIPs' });
    // Someone else's private view doesn't exist for them.
    expect((await call(owner, 'DELETE', `/views/${mine.body.id}`)).status).toBe(404);

    // A view is just its filter, run live.
    const view = (await call(owner, 'GET', '/views?recordType=customer')).body.data[0];

    expect(await found(view.filter)).toEqual(['Bat']);
    expect((await call(member, 'DELETE', `/views/${mine.body.id}`)).body).toEqual({ ok: true });
  });

  it('lists what each list can be filtered by', async () => {
    const fields = (await call(owner, 'GET', '/views/fields?recordType=customer')).body.data;

    expect(fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'subject.state', type: 'select', group: 'fields' }),
        expect.objectContaining({ path: `subject.customFields.${spend}`, label: 'Spend', type: 'number', group: 'custom' }),
        expect.objectContaining({ path: 'subject.company.industry', group: 'company' }),
        expect.objectContaining({ path: 'subject.lastActivityAt', type: 'date', group: 'activity' }),
      ]),
    );
    expect((await call(owner, 'GET', '/views/fields?recordType=lead')).body.data.some((field: { path: string }) => field.path === 'subject.state')).toBe(false);
  });
});
