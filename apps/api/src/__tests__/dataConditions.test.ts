import { conditionHolds, type DataExtensionFieldSettings, fieldShows } from '@erxes/core-contract';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

/**
 * Field options old properties have: hidden, filterable, and conditions of many rules that
 * show, hide or require a field, as old `logic` did.
 */
describe('Data Extensions conditions and field options', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();
  const ids = new Map<string, string>();
  let customerId = '';

  beforeAll(async () => {
    const owner = t.owner();

    const add = async (input: Parameters<typeof owner.dataFields.create>[0]) =>
      ids.set(input.key, (await owner.dataFields.create(input)).id);

    await add({ recordType: 'core.customer', key: 'score', label: 'Score', type: 'number' });
    await add({ recordType: 'core.customer', key: 'note', label: 'Note', type: 'text' });
    await add({
      recordType: 'core.customer',
      key: 'reason',
      label: 'Reason',
      type: 'text',
      settings: {
        requiredWhen: {
          match: 'all',
          rules: [
            { field: 'score', operator: 'greaterThan', value: 5 },
            { field: 'note', operator: 'contains', value: 'VIP' },
          ],
        },
        hiddenWhen: { field: 'score', operator: 'isEmpty' },
        hidden: true,
        filterable: false,
      },
    });
    customerId = (await owner.customers.create({ firstName: 'Saraa' })).id;
  });

  const write = (values: Record<string, string | number | null>) =>
    t.owner().dataValues.update({ recordType: 'core.customer', recordId: customerId, values });

  it('keeps the new options and conditions as they were set', async () => {
    const { data } = await t.owner().dataFields.list({ recordType: 'core.customer' });

    expect(data.find((field) => field.key === 'reason')?.settings).toEqual({
      requiredWhen: {
        match: 'all',
        rules: [
          { field: 'score', operator: 'greaterThan', value: 5 },
          { field: 'note', operator: 'contains', value: 'VIP' },
        ],
      },
      hiddenWhen: { field: 'score', operator: 'isEmpty' },
      hidden: true,
      filterable: false,
    });
  });

  it('requires a field while every rule of its condition holds', async () => {
    await expect(write({ score: 9, note: 'a vip customer' })).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_INPUT',
      data: { issues: [{ path: ['values', 'reason'] }] },
    });
    // One rule fails: not required.
    await expect(write({ score: 3, note: 'a vip customer' })).resolves.toMatchObject({
      values: { score: 3, reason: null },
    });
    await expect(write({ score: 9, reason: 'Big order' })).resolves.toMatchObject({
      values: { score: 9, note: 'a vip customer', reason: 'Big order' },
    });
  });

  it('refuses a rule on a field the record type lacks, at the rule', async () => {
    await expect(
      t.owner().dataFields.update({
        id: ids.get('note') ?? '',
        settings: {
          visibleWhen: {
            match: 'any',
            rules: [
              { field: 'score', operator: 'eq', value: 1 },
              { field: 'nope', operator: 'isNotEmpty' },
            ],
          },
        },
      }),
    ).rejects.toMatchObject({
      code: 'INVALID_INPUT',
      data: { issues: [{ path: ['settings', 'visibleWhen', 'rules', 1, 'field'] }] },
    });
  });

  it('carries conditions to a renamed field, in every rule', async () => {
    await t.owner().dataFields.update({ id: ids.get('score') ?? '', key: 'rating' });

    const { data } = await t.owner().dataFields.list({ recordType: 'core.customer' });
    const reason = data.find((field) => field.key === 'reason')?.settings;

    expect(reason?.requiredWhen).toMatchObject({
      rules: [{ field: 'rating' }, { field: 'note' }],
    });
    expect(reason?.hiddenWhen).toEqual({ field: 'rating', operator: 'isEmpty' });
  });

  it('leaves a field that isn’t filterable out of the list filters', async () => {
    const { data } = await t.owner().views.fields({ recordType: 'customer' });
    const paths = data.map((field) => field.path);

    expect(paths).toEqual(expect.arrayContaining(['subject.data.rating', 'subject.data.note']));
    expect(paths).not.toContain('subject.data.reason');
  });

  it('compares the way old properties’ logic did, each operator', () => {
    const values = { tags: ['Gold', 'vip'], amount: 12, day: '2026-03-01', empty: '' };

    for (const [rule, holds] of [
      [{ field: 'tags', operator: 'eq', value: 'vip' }, true],
      [{ field: 'tags', operator: 'neq', value: 'vip' }, false],
      [{ field: 'tags', operator: 'contains', value: 'GOL' }, true],
      [{ field: 'amount', operator: 'greaterThan', value: 10 }, true],
      [{ field: 'amount', operator: 'lessThan', value: 10 }, false],
      [{ field: 'day', operator: 'lessThan', value: '2026-04-01' }, true],
      [{ field: 'empty', operator: 'isEmpty' }, true],
      [{ field: 'empty', operator: 'isNotEmpty' }, false],
      [{ field: 'gone', operator: 'isEmpty' }, false],
    ] as const) {
      expect(conditionHolds(rule, values)).toBe(holds);
    }

    // Old `hide` logic: shown unless all its rules hold.
    const hide: DataExtensionFieldSettings = {
      hiddenWhen: {
        match: 'all',
        rules: [
          { field: 'amount', operator: 'greaterThan', value: 10 },
          { field: 'tags', operator: 'eq', value: 'vip' },
        ],
      },
    };

    expect(fieldShows(hide, values)).toBe(false);
    expect(fieldShows(hide, { ...values, amount: 1 })).toBe(true);
    expect(
      fieldShows(
        { visibleWhen: { match: 'any', rules: [{ field: 'amount', operator: 'eq', value: 1 }] } },
        values,
      ),
    ).toBe(false);
  });
});
