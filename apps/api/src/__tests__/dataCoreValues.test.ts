import { withSystem } from '@erxes/core-db';
import { sql } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { sweepRemovedRecords } from '~/modules/dataExtensions/hostRecords';
import { adminDb, useTestDatabase } from './db';
import { useTwoOrgs } from './support';

/** A list filter: customers of this tier. */
const tierFilter = (value: string) =>
  JSON.stringify({ match: 'all', rules: [{ path: 'subject.data.tier', op: 'eq', value }] });

/** Customers, companies and products carry their Data Extensions values, and lists use them. */
describe('Data Extensions values on core’s records', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  /** Rows core keeps for the customer's values. */
  const keptRows = async (id: string) => {
    const { rows } = await adminDb().execute(
      sql`select count(*)::int as total from ${sql.identifier(`data_${t.ids.org}`)}.ext_core_customer where record_id = ${id}`,
    );

    return Number(rows[0]?.total);
  };

  beforeAll(async () => {
    const owner = t.owner();

    await owner.dataFields.create({
      recordType: 'core.customer',
      key: 'tier',
      label: 'Tier',
      type: 'select',
      options: [
        { value: 'gold', label: 'Gold', color: 'yellow' },
        { value: 'silver', label: 'Silver', color: 'gray' },
      ],
    });
    await owner.dataFields.create({
      recordType: 'core.customer',
      key: 'spend',
      label: 'Spend',
      type: 'number',
    });
    await owner.dataFields.create({
      recordType: 'core.customer',
      key: 'secret',
      label: 'Secret',
      type: 'text',
      settings: { visibleTo: ['admin'] },
    });
    await owner.dataFields.create({
      recordType: 'core.company',
      key: 'band',
      label: 'Size band',
      type: 'number',
    });
    await owner.dataFields.create({
      recordType: 'core.company',
      key: 'region',
      label: 'Region',
      type: 'text',
      settings: { requiredWhen: { field: 'band', operator: 'greaterThan', value: 100 } },
    });
    await owner.dataFields.create({
      recordType: 'core.product',
      key: 'warranty',
      label: 'Warranty',
      type: 'number',
    });
  });

  it('writes values with a record, in its transaction, and answers with them', async () => {
    const owner = t.owner();

    const saraa = await owner.customers.create({
      firstName: 'Saraa',
      values: { tier: 'gold', spend: 300, secret: 'x' },
    });

    expect(saraa.values).toEqual({ tier: 'gold', spend: 300, secret: 'x' });

    // A refused value refuses the whole create.
    await expect(
      owner.customers.create({ firstName: 'Bold', values: { tier: 'platinum' } }),
    ).rejects.toMatchObject({
      code: 'INVALID_INPUT',
      data: { issues: [{ path: ['values', 'tier'] }] },
    });
    expect((await owner.customers.list({ search: 'Bold' })).data).toEqual([]);

    const updated = await owner.customers.update({ id: saraa.id, values: { spend: 450 } });

    expect(updated.values).toEqual({ tier: 'gold', spend: 450, secret: 'x' });

    // The change is in the record's value history.
    const history = await owner.dataChanges.history({
      recordType: 'core.customer',
      recordId: saraa.id,
    });

    expect(history.data.length).toBeGreaterThanOrEqual(2);

    // A member's role reads only the fields it may see.
    expect((await t.member().customers.get({ id: saraa.id })).values).toEqual({
      tier: 'gold',
      spend: 450,
    });
  });

  it('checks a record’s rules on its own update, as on a direct write', async () => {
    const owner = t.owner();
    const acme = await owner.companies.create({ primaryName: 'Acme', values: { band: 5 } });

    await expect(
      owner.companies.update({ id: acme.id, values: { band: 500 } }),
    ).rejects.toMatchObject({
      code: 'INVALID_INPUT',
      data: { issues: [{ path: ['values', 'region'] }] },
    });
    await expect(
      owner.companies.update({ id: acme.id, values: { band: 500, region: 'East' } }),
    ).resolves.toMatchObject({ values: { band: 500, region: 'East' } });

    const bolt = await owner.products.create({
      kind: 'goods',
      name: 'Bolt',
      values: { warranty: 12 },
    });

    expect(bolt.values).toEqual({ warranty: 12 });
    expect((await owner.products.get({ id: bolt.id })).values).toEqual({ warranty: 12 });
    expect((await owner.products.list({})).data[0]?.values).toEqual({ warranty: 12 });
  });

  it('filters and sorts lists by the fields, and pages in that order', async () => {
    const owner = t.owner();

    await owner.customers.create({ firstName: 'Anu', values: { tier: 'silver', spend: 100 } });
    await owner.customers.create({ firstName: 'Dorj', values: { tier: 'gold', spend: 900 } });
    await owner.customers.create({ firstName: 'Empty' });

    const gold = await owner.customers.list({ filter: tierFilter('gold') });

    expect(
      gold.data.map((row) => row.firstName ?? '').toSorted((a, b) => a.localeCompare(b)),
    ).toEqual(['Dorj', 'Saraa']);

    const first = await owner.customers.list({
      sortField: 'data.spend',
      sortDirection: 'desc',
      limit: 2,
    });

    expect(first.data.map((row) => row.firstName)).toEqual(['Dorj', 'Saraa']);

    const rest = await owner.customers.list({
      sortField: 'data.spend',
      sortDirection: 'desc',
      limit: 2,
      cursor: first.pageInfo.endCursor ?? undefined,
    });

    // Records without a value come last.
    expect(rest.data.map((row) => row.firstName)).toEqual(['Anu', 'Empty']);

    await expect(owner.customers.list({ sortField: 'data.nope' })).rejects.toMatchObject({
      code: 'INVALID_FILTER',
    });
    // A field the caller can't see neither filters nor sorts.
    await expect(t.member().customers.list({ sortField: 'data.secret' })).rejects.toMatchObject({
      code: 'INVALID_FILTER',
    });
    expect(
      (await t.member().views.fields({ recordType: 'customer' })).data.map((field) => field.path),
    ).not.toContain('subject.data.secret');
  });

  it('keeps a text list, old properties’ `list`, item by item', async () => {
    const owner = t.owner();

    await owner.dataFields.create({
      recordType: 'core.customer',
      key: 'nicknames',
      label: 'Nicknames',
      type: 'textList',
    });

    const tuya = await owner.customers.create({
      firstName: 'Tuya',
      values: { nicknames: [' Tuyka ', '', 'Sun'] },
    });

    expect(tuya.values.nicknames).toEqual(['Tuyka', 'Sun']);

    const found = await owner.customers.list({
      filter: JSON.stringify({
        match: 'all',
        rules: [{ path: 'subject.data.nicknames', op: 'eq', value: 'Sun' }],
      }),
    });

    expect(found.data.map((row) => row.firstName)).toEqual(['Tuya']);
  });

  it('saves views over the fields, beside custom fields', async () => {
    const owner = t.owner();

    const view = await owner.views.create({
      recordType: 'customer',
      name: 'Gold, biggest first',
      filter: { match: 'all', rules: [{ path: 'subject.data.tier', op: 'eq', value: 'gold' }] },
      sort: { field: 'data.spend', direction: 'desc' },
    });

    expect(view).toMatchObject({ sort: { field: 'data.spend', direction: 'desc' } });
    await expect(
      owner.views.create({
        recordType: 'customer',
        name: 'Broken',
        sort: { field: 'data.nope', direction: 'asc' },
      }),
    ).rejects.toMatchObject({ code: 'INVALID_FILTER' });
    await expect(
      owner.views.create({
        recordType: 'customer',
        name: 'Broken',
        filter: { match: 'all', rules: [{ path: 'subject.data.nope', op: 'eq', value: 1 }] },
      }),
    ).rejects.toMatchObject({ code: 'INVALID_FILTER' });

    const fields = (await owner.views.fields({ recordType: 'customer' })).data;

    expect(fields.find((field) => field.path === 'subject.data.tier')).toEqual({
      path: 'subject.data.tier',
      label: 'Tier',
      type: 'select',
      options: ['gold', 'silver'],
      group: 'custom',
    });
  });

  it('brings a binned customer back with its values; the sweep keeps them until it is purged', async () => {
    const owner = t.owner();
    const gone = await owner.customers.create({ firstName: 'Binned', values: { tier: 'gold' } });

    await owner.customers.remove({ ids: [gone.id] });
    await withSystem('test', (tx) => sweepRemovedRecords(tx));
    expect(await keptRows(gone.id)).toBe(1);

    const [binned] = (await owner.trash.list({})).data;

    await owner.trash.restore({ ids: [binned?.id ?? ''] });
    expect((await owner.customers.get({ id: gone.id })).values.tier).toBe('gold');

    // Purged for good: the hourly sweep removes its values.
    await owner.customers.remove({ ids: [gone.id] });
    await owner.trash.purge({ ids: (await owner.trash.list({})).data.map((item) => item.id) });
    await withSystem('test', (tx) => sweepRemovedRecords(tx));

    expect(await keptRows(gone.id)).toBe(0);
  });
});
