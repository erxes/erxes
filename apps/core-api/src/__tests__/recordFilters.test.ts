import { activities, customers, newId } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { expect, it } from 'vite-plus/test';
import { rule, useContacts } from './contacts.fixture';
import { adminDb, describeWithDb, useTestDatabase } from './db';

const custom = (fieldId: string) => `subject.customFields.${fieldId}`;

describeWithDb('advanced filters on contact lists', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useContacts();
  const found = (filter: Parameters<typeof t.customersWhere>[0]) => t.customersWhere(filter);

  it('filters by fields, custom fields, tags, owner, dates, the company and nested groups', async () => {
    expect(await found(rule('subject.state', 'eq', 'lead'))).toEqual(['Bat']);
    expect(await found(rule('subject.state', 'in', ['lead']))).toEqual(['Bat']);
    expect(await found(rule('subject.firstName', 'not_in', ['bat', 'dorj']))).toEqual(['Saraa']);
    expect(await found(rule('subject.primaryEmail', 'contains', 'GOLF'))).toEqual(['Bat']);
    expect(await found(rule('subject.primaryEmail', 'not_exists'))).toEqual(['Dorj']);
    expect(await found(rule('subject.tagIds', 'contains', t.vip()))).toEqual(['Bat']);
    expect(await found(rule('subject.tagIds', 'not_exists'))).toEqual(['Dorj', 'Saraa']);
    expect(await t.customersWhere(rule('subject.ownerId', 'eq', 'me'), t.member())).toEqual([
      'Dorj',
    ]);
    expect(await found(rule(custom(t.fields.spend), 'gt', 1000))).toEqual(['Bat']);
    expect(await found(rule(custom(t.fields.spend), 'lte', 1000))).toEqual(['Dorj']);
    expect(await found(rule(custom(t.fields.interests), 'contains', 'golf'))).toEqual(['Bat']);
    expect(
      await found(rule('subject.createdAt', 'more_than_ago', { amount: 30, unit: 'days' })),
    ).toEqual(['Dorj']);
    expect(
      await found(rule('subject.createdAt', 'within_last', { amount: 1, unit: 'weeks' })),
    ).toEqual(['Bat', 'Saraa']);
    expect(await found(rule('subject.birthDate', 'anniversary_within', { amount: 7 }))).toEqual([
      'Bat',
    ]);
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
              { path: custom(t.fields.spend), op: 'gt', value: 100 },
            ],
          },
          { path: 'subject.primaryEmail', op: 'not_contains', value: 'shop' },
        ],
      }),
    ).toEqual(['Bat', 'Dorj']);

    // Companies: by their customers.
    expect(await t.companiesWhere(rule('subject.customerCount', 'gte', 1))).toEqual(['Retail Co']);
    expect(await t.companiesWhere(rule('subject.size', 'gt', 10))).toEqual(['Retail Co']);

    // Filters combine with the list's own (state, search).
    expect(
      await t.customersWhere(rule('subject.tagIds', 'exists'), t.owner(), { state: 'customer' }),
    ).toEqual([]);
  });

  it('filters by company properties, treats a missing value as "not", and keeps last activity from the timeline', async () => {
    const owner = t.owner();
    const { bat, dorj, retail } = t.contacts;

    const region = (
      await owner.fields.create({
        contentType: 'company',
        label: 'Region',
        type: 'select',
        options: ['North', 'South'],
      })
    ).id;

    const isMember = (
      await owner.fields.create({ contentType: 'customer', label: 'Member', type: 'boolean' })
    ).id;

    const renewal = (
      await owner.fields.create({ contentType: 'customer', label: 'Renewal', type: 'date' })
    ).id;

    const inTen = new Date(Date.now() + 10 * 86_400_000).toISOString().slice(0, 10);

    await owner.companies.update({ id: retail, customFields: { [region]: 'North' } });
    await owner.customers.update({ id: bat, customFields: { [isMember]: true, [renewal]: inTen } });
    await owner.customers.update({ id: dorj, customFields: { [isMember]: false } });

    // Customers by their company's properties.
    expect(await found(rule(`subject.company.customFields.${region}`, 'eq', 'north'))).toEqual([
      'Saraa',
    ]);
    expect(await found(rule(`subject.company.customFields.${region}`, 'neq', 'North'))).toEqual([
      'Bat',
      'Dorj',
    ]);
    // No value is "no"; "is not" includes records without a value.
    expect(await found(rule(custom(isMember), 'eq', true))).toEqual(['Bat']);
    expect(await found(rule(custom(isMember), 'eq', false))).toEqual(['Dorj', 'Saraa']);
    expect(await found(rule(custom(t.fields.spend), 'neq', 200))).toEqual(['Bat', 'Saraa']);
    expect(await found(rule(custom(t.fields.spend), 'not_exists'))).toEqual(['Saraa']);
    expect(await found(rule(custom(t.fields.interests), 'not_contains', 'golf'))).toEqual([
      'Dorj',
      'Saraa',
    ]);
    expect(await found(rule(custom(renewal), 'within_next', { amount: 2, unit: 'weeks' }))).toEqual(
      ['Bat'],
    );
    expect(await found(rule(custom(renewal), 'anniversary_within', { amount: 12 }))).toEqual([
      'Bat',
    ]);

    // Values read back as they were set.
    expect((await owner.customers.get({ id: bat })).customFields).toEqual({
      [t.fields.spend]: 1500,
      [t.fields.interests]: ['golf'],
      [isMember]: true,
      [renewal]: inTen,
    });

    // Last activity: every timeline entry moves it; creation counts.
    await adminDb()
      .update(customers)
      .set({ lastActivityAt: sql`now() - interval '90 days'` })
      .where(eq(customers.orgId, t.ids.org));
    expect(
      await found(rule('subject.lastActivityAt', 'more_than_ago', { amount: 60, unit: 'days' })),
    ).toEqual(['Bat', 'Dorj', 'Saraa']);
    await adminDb().insert(activities).values({
      id: newId(),
      orgId: t.ids.org,
      targetType: 'customer',
      targetId: dorj,
      source: 'core',
      type: 'customer.note',
      actorType: 'system',
    });
    expect(
      await found(rule('subject.lastActivityAt', 'within_last', { amount: 1, unit: 'days' })),
    ).toEqual(['Dorj']);

    // The search box: every word somewhere in names, emails, phones or code.
    expect(
      (await owner.customers.list({ search: 'SHOP saraa' })).data.map((row) => row.firstName),
    ).toEqual(['Saraa']);
  });

  it('refuses filters that do not fit', async () => {
    const refused = { code: 'INVALID_FILTER' };

    await expect(found(rule('subject.nope', 'eq', 'x'))).rejects.toMatchObject(refused);
    await expect(found(rule(custom(t.fields.spend), 'contains', 'x'))).rejects.toMatchObject(
      refused,
    );
    await expect(
      found(rule('subject.createdAt', 'within_last', { amount: 'many' })),
    ).rejects.toMatchObject(refused);
    await expect(t.owner().customers.list({ filter: 'not-json' })).rejects.toMatchObject(refused);
  });
});
