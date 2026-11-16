import type { ConditionGroup, PluginManifest } from '@erxes/core-contract';
import { pluginInstallations } from '@erxes/core-db';
import { and, eq, sql } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { pluginRoleSql } from '~/modules/plugins/pluginRole';
import { rule, useContacts } from './contacts.fixture';
import { adminDb, useTestDatabase } from './db';

const DEALS = 'subject.related.hr.deals';

const MANIFEST: PluginManifest = {
  title: 'HR',
  version: '1',
  scopes: [],
  permissions: [{ action: 'hr.deals.view', label: 'View deals' }],
  relations: [
    {
      key: 'deals',
      contentType: 'customer',
      label: 'Deals',
      view: 'hr_customer_deals',
      permission: 'hr.deals.view',
      fields: [
        // No lowest amount: the filter lists the measures the plugin names.
        {
          key: 'amount',
          label: 'Amount',
          type: 'number',
          money: true,
          measures: ['sum', 'avg', 'max'],
        },
        { key: 'stage', label: 'Stage', type: 'select', options: ['Won', 'Lost'] },
        { key: 'closed_on', label: 'Closed', type: 'date' },
        { key: 'product_id', label: 'Product', type: 'product' },
      ],
    },
  ],
};

/** The plugin's own table and view, made as its database role, like its migrations would. */
const PLUGIN_SQL = `
  GRANT erxes_plugin_hr TO current_user;
  SET ROLE erxes_plugin_hr;
  CREATE TABLE hr_deals (
    id text PRIMARY KEY, org_id text NOT NULL, customer_id text, amount numeric, stage text, closed_on date,
    product_id text
  );
  SELECT core_enable_tenant_rls('hr_deals');
  CREATE VIEW hr_customer_deals AS
    SELECT org_id, customer_id AS record_id, amount, stage, closed_on, product_id FROM hr_deals;
  GRANT SELECT ON hr_customer_deals TO erxes_core_reader;
  CREATE VIEW hr_unshared AS SELECT customer_id AS record_id FROM hr_deals;
  RESET ROLE;
  CREATE VIEW hr_not_its_own AS SELECT id AS record_id FROM core_customers;
  GRANT SELECT ON hr_not_its_own TO erxes_core_reader;
`;

const ago = (days: number) => sql`current_date - ${days}::int`;

/** "Has a deal where …". */
const dealsWhere = (where: ConditionGroup['rules']): ConditionGroup['rules'][number] => ({
  path: `${DEALS}.count`,
  op: 'gte',
  value: 1,
  where: { match: 'all', rules: where },
});

describe('relation filters: customers by a plugin’s records', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useContacts();
  const found = (filter: ConditionGroup) => t.customersWhere(filter);

  beforeAll(async () => {
    await adminDb().execute(sql.raw(pluginRoleSql('hr')));
    await adminDb().execute(sql.raw(PLUGIN_SQL));
    await t.client(await t.pluginToken()).plugins.registerManifest(MANIFEST);

    const { bat, dorj, saraa } = t.contacts;

    // Bat: won 1500 ten days ago (product p1), lost 300 a hundred days ago (p2). Dorj: won 200
    // seventy days ago (p2). Saraa: none here; Globex's deal on her id stays in Globex.
    for (const [id, org, customer, amount, stage, days, product] of [
      ['d1', t.ids.org, bat, 1500, 'Won', 10, 'p1'],
      ['d2', t.ids.org, bat, 300, 'Lost', 100, 'p2'],
      ['d3', t.ids.org, dorj, 200, 'Won', 70, 'p2'],
      ['d4', t.ids.otherOrg, saraa, 9000, 'Won', 1, 'p1'],
    ] as const) {
      await adminDb().execute(
        sql`insert into hr_deals values (${id}, ${org}, ${customer}, ${amount}, ${stage}, ${ago(days)}, ${product})`,
      );
    }
  });

  it('lists each relation’s measures, with the fields its rules narrow by', async () => {
    const fields = (await t.owner().views.fields({ recordType: 'customer' })).data;
    const ofDeals = fields.filter((field) => field.path.startsWith(DEALS));

    expect(ofDeals.map((field) => [field.path, field.label, field.type])).toEqual([
      [`${DEALS}.count`, 'Deals: count', 'number'],
      [`${DEALS}.sum.amount`, 'Deals: Amount (total)', 'number'],
      [`${DEALS}.avg.amount`, 'Deals: Amount (average)', 'number'],
      [`${DEALS}.max.amount`, 'Deals: Amount (highest)', 'number'],
      [`${DEALS}.min.closed_on`, 'Deals: Closed (earliest)', 'date'],
      [`${DEALS}.max.closed_on`, 'Deals: Closed (latest)', 'date'],
    ]);
    expect(ofDeals[1]).toMatchObject({ group: 'plugin', groupLabel: 'HR', currency: 'USD' });
    expect(ofDeals[0]?.relation?.fields.map((field) => [field.path, field.type])).toEqual([
      ['subject.amount', 'number'],
      ['subject.stage', 'select'],
      ['subject.closed_on', 'date'],
      ['subject.product_id', 'product'],
    ]);
    // Companies have no deals here.
    expect(
      (await t.owner().views.fields({ recordType: 'company' })).data.some((field) =>
        field.path.startsWith('subject.related.'),
      ),
    ).toBe(false);
  });

  it('filters by how many, totals, extremes and dates, counting records with none', async () => {
    expect(await found(rule(`${DEALS}.count`, 'gte', 2))).toEqual(['Bat']);
    expect(await found(rule(`${DEALS}.count`, 'eq', 0))).toEqual(['Saraa']);
    expect(await found(rule(`${DEALS}.count`, 'lt', 2))).toEqual(['Dorj', 'Saraa']);
    expect(await found(rule(`${DEALS}.count`, 'neq', 1))).toEqual(['Bat', 'Saraa']);
    expect(await found(rule(`${DEALS}.count`, 'exists'))).toEqual(['Bat', 'Dorj']);
    expect(await found(rule(`${DEALS}.count`, 'not_exists'))).toEqual(['Saraa']);
    expect(await found(rule(`${DEALS}.sum.amount`, 'gt', 1000))).toEqual(['Bat']);
    expect(await found(rule(`${DEALS}.sum.amount`, 'lt', 500))).toEqual(['Dorj', 'Saraa']);
    expect(await found(rule(`${DEALS}.avg.amount`, 'gte', 900))).toEqual(['Bat']);
    // No deals has no highest amount.
    expect(await found(rule(`${DEALS}.max.amount`, 'lt', 1000))).toEqual(['Dorj']);
    expect(
      await found(rule(`${DEALS}.max.closed_on`, 'more_than_ago', { amount: 30, unit: 'days' })),
    ).toEqual(['Dorj']);
    expect(
      await found(rule(`${DEALS}.max.closed_on`, 'within_last', { amount: 30, unit: 'days' })),
    ).toEqual(['Bat']);
    expect(
      await found(rule(`${DEALS}.min.closed_on`, 'more_than_ago', { amount: 90, unit: 'days' })),
    ).toEqual(['Bat']);
  });

  it('narrows the related records with where, and combines with other rules', async () => {
    expect(
      await found({
        match: 'all',
        rules: [dealsWhere([{ path: 'subject.stage', op: 'in', value: ['Won'] }])],
      }),
    ).toEqual(['Bat', 'Dorj']);
    // A product field holds product ids: "bought p1", "never bought p2".
    expect(
      await found({
        match: 'all',
        rules: [dealsWhere([{ path: 'subject.product_id', op: 'in', value: ['p1'] }])],
      }),
    ).toEqual(['Bat']);
    expect(
      await found({
        match: 'all',
        rules: [
          {
            path: `${DEALS}.count`,
            op: 'eq',
            value: 0,
            where: {
              match: 'all',
              rules: [{ path: 'subject.product_id', op: 'eq', value: 'p2' }],
            },
          },
        ],
      }),
    ).toEqual(['Saraa']);
    expect(
      await found({
        match: 'all',
        rules: [
          {
            path: `${DEALS}.sum.amount`,
            op: 'lt',
            value: 100,
            where: {
              match: 'all',
              rules: [
                { path: 'subject.stage', op: 'eq', value: 'Lost' },
                {
                  path: 'subject.closed_on',
                  op: 'within_last',
                  value: { amount: 1, unit: 'months' },
                },
              ],
            },
          },
        ],
      }),
    ).toEqual(['Bat', 'Dorj', 'Saraa']);
    // Won a deal and isn't a lead: Dorj.
    expect(
      await found({
        match: 'all',
        rules: [
          dealsWhere([{ path: 'subject.stage', op: 'eq', value: 'Won' }]),
          { path: 'subject.state', op: 'eq', value: 'customer' },
        ],
      }),
    ).toEqual(['Dorj']);
    // Leads, or anyone who lost a deal.
    expect(
      await found({
        match: 'any',
        rules: [
          { path: 'subject.state', op: 'eq', value: 'lead' },
          dealsWhere([{ path: 'subject.stage', op: 'eq', value: 'Lost' }]),
        ],
      }),
    ).toEqual(['Bat']);
  });

  it('refuses rules that do not fit, and relations the member or the plugin cannot use', async () => {
    const refused = { code: 'INVALID_FILTER' };

    await expect(
      found({
        match: 'all',
        rules: [dealsWhere([{ path: 'subject.nope', op: 'eq', value: 'x' }])],
      }),
    ).rejects.toMatchObject(refused);
    await expect(
      found({
        match: 'all',
        rules: [
          { path: 'subject.firstName', op: 'eq', value: 'Bat', where: { match: 'all', rules: [] } },
        ],
      }),
    ).rejects.toMatchObject(refused);
    await expect(found(rule(`${DEALS}.sum.stage`, 'gt', 1))).rejects.toMatchObject(refused);
    // A measure the plugin doesn't list.
    await expect(found(rule(`${DEALS}.min.amount`, 'gt', 1))).rejects.toMatchObject(refused);

    // The viewer's role lacks hr.deals.view: no deal fields, no deal rules.
    const viewer = t.viewer();

    expect(
      (await viewer.views.fields({ recordType: 'customer' })).data.some((field) =>
        field.path.startsWith(DEALS),
      ),
    ).toBe(false);
    await expect(t.customersWhere(rule(`${DEALS}.count`, 'gte', 1), viewer)).rejects.toMatchObject(
      refused,
    );

    // Uninstalled, the plugin's relations go.
    const installation = and(
      eq(pluginInstallations.orgId, t.ids.org),
      eq(pluginInstallations.plugin, 'hr'),
    );

    await adminDb().update(pluginInstallations).set({ status: 'disabled' }).where(installation);
    await expect(found(rule(`${DEALS}.count`, 'gte', 1))).rejects.toMatchObject(refused);
    await adminDb().update(pluginInstallations).set({ status: 'active' }).where(installation);
  });

  it('reads only views the plugin owns and shares, and only plugin-named ones register', async () => {
    const service = t.client(await t.pluginToken());

    const withView = (view: string, permission = 'hr.deals.view'): PluginManifest => ({
      ...MANIFEST,
      relations: [
        { key: 'deals', contentType: 'customer', label: 'Deals', view, permission, fields: [] },
      ],
    });

    await expect(
      service.plugins.registerManifest(withView('core_customers')),
    ).rejects.toMatchObject({ code: 'NAMESPACE_REQUIRED' });
    await expect(
      service.plugins.registerManifest(withView('hr_customer_deals', 'hr.nope')),
    ).rejects.toMatchObject({ code: 'UNKNOWN_PERMISSION' });

    const notReady = { code: 'INVALID_FILTER', message: "Deals can't be filtered by yet" };

    // Core's owner made this one: not the plugin's, so never read.
    await service.plugins.registerManifest(withView('hr_not_its_own'));
    await expect(found(rule(`${DEALS}.count`, 'gte', 1))).rejects.toMatchObject(notReady);

    // The plugin's, but not granted to core.
    await service.plugins.registerManifest(withView('hr_unshared'));
    await expect(found(rule(`${DEALS}.count`, 'gte', 1))).rejects.toMatchObject(notReady);

    await service.plugins.registerManifest(MANIFEST);
    expect(await found(rule(`${DEALS}.count`, 'gte', 1))).toEqual(['Bat', 'Dorj']);
  });
});
