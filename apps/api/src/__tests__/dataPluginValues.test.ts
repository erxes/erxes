import { sql } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { adminDb, useTestDatabase } from './db';
import { saveCustomFields, setUpHr } from './hrPlugin';
import { useTwoOrgs } from './support';

describe('Data Extensions values a plugin keeps', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  /** HR's employee fields' ids by key. */
  const ids = new Map<string, string>();
  const id = (key: string) => ids.get(key) ?? key;

  /** Values by field key, as HR keeps them by field id. */
  const byId = (values: Record<string, string | number | string[] | null>) =>
    Object.fromEntries(Object.entries(values).map(([key, value]) => [id(key), value]));

  /** A refused value's issue: its field id in the patch. */
  const issueAt = (key: string) => ({ issues: [{ path: ['patch', id(key)] }] });

  const saved = { team: 'Ops', priority: 'high', note: 'Call back', score: 3 };
  let customerId = '';

  type FieldInput = Omit<
    Parameters<ReturnType<typeof t.owner>['dataFields']['create']>[0],
    'recordType'
  >;

  const field = (input: FieldInput) =>
    t.owner().dataFields.create({ recordType: 'hr.employee', ...input });

  beforeAll(async () => {
    await setUpHr(t);
    await t.owner().dataPlugins.connect({ plugin: 'hr' });

    const fields: FieldInput[] = [
      { key: 'team', label: 'Team', type: 'text', settings: { required: true } },
      {
        key: 'priority',
        label: 'Priority',
        type: 'select',
        options: [
          { value: 'low', label: 'Low', color: 'gray' },
          { value: 'high', label: 'High', color: 'red' },
        ],
      },
      {
        key: 'note',
        label: 'Note',
        type: 'text',
        settings: { requiredWhen: { field: 'priority', operator: 'eq', value: 'high' } },
      },
      {
        key: 'score',
        label: 'Score',
        type: 'number',
        settings: { min: 0, max: 10, editableBy: ['admin'] },
      },
      {
        key: 'rank',
        label: 'Rank',
        type: 'formula',
        settings: { formula: { expression: 'CONCAT(UPPER({priority}), " ", TEXT({score} * 10))' } },
      },
    ];

    for (const input of fields) {
      const made = await field(input);

      ids.set(made.key, made.id);
    }
  });

  it('makes no table for a plugin’s records, and refuses what core can’t do with them', async () => {
    const owner = t.owner();
    const invalid = { code: 'INVALID_INPUT' };

    await expect(
      field({ key: 'code', label: 'Code', type: 'text', settings: { unique: true } }),
    ).rejects.toMatchObject(invalid);
    await expect(field({ key: 'number', label: 'No.', type: 'autoNumber' })).rejects.toMatchObject(
      invalid,
    );
    await expect(
      owner.dataFields.update({ id: id('team'), settings: { required: true, unique: true } }),
    ).rejects.toMatchObject(invalid);
    await expect(
      owner.dataChanges.convert({ id: id('note'), type: 'longText', apply: true }),
    ).rejects.toMatchObject({ code: 'INVALID_TYPE' });
    await expect(
      owner.dataChanges.history({ recordType: 'hr.employee', recordId: 'e1' }),
    ).rejects.toMatchObject({ code: 'INVALID_REFERENCE' });
    await expect(
      owner.dataValues.update({ recordType: 'hr.employee', recordId: 'e1', values: { team: 'A' } }),
    ).rejects.toMatchObject({ code: 'INVALID_REFERENCE', data: { field: 'recordType' } });

    const { rows } = await adminDb().execute(
      sql`select count(*)::int as tables from information_schema.tables where table_name like 'ext_hr%'`,
    );

    expect(rows).toEqual([{ tables: 0 }]);
  });

  it('checks a plugin’s values with the rules core’s own values follow', async () => {
    const check = (
      patch: Record<string, string | number | null>,
      more: { current?: Record<string, string>; create?: boolean } = {},
    ) =>
      t.hr().dataValues.check({
        recordType: 'hr.employee',
        current: byId(more.current ?? { team: 'Ops' }),
        patch: byId(patch),
        create: more.create,
      });

    for (const [key, value] of [
      ['score', 'x'],
      ['score', 11],
      ['priority', 'urgent'],
      ['rank', 'x'],
    ] as const) {
      await expect(check({ [key]: value })).rejects.toMatchObject({
        code: 'INVALID_INPUT',
        data: issueAt(key),
      });
    }

    // Each patch names an active field; high priority needs a note; a new record its team.
    await expect(check({ nope: 1 })).rejects.toMatchObject({ data: issueAt('nope') });
    await expect(check({ priority: 'high' })).rejects.toMatchObject({ data: issueAt('note') });
    await expect(check({ priority: 'low' }, { current: {}, create: true })).rejects.toMatchObject({
      data: issueAt('team'),
    });
    await expect(check({ priority: 'high', note: '  Call back ', score: 3 })).resolves.toEqual({
      values: byId(saved),
    });
    // A null clears a value; one of no active field stays as it was.
    await expect(
      check({ note: null }, { current: { team: 'Ops', note: 'x', legacy: 'kept' } }),
    ).resolves.toEqual({ values: byId({ team: 'Ops', legacy: 'kept' }) });
  });

  it('checks only a plugin’s own records, as the member who changes them', async () => {
    const hr = t.hr();
    const patch = byId({ score: 4 });
    const notAllowed = { status: 403, code: 'NOT_ALLOWED' };

    await expect(
      hr.dataValues.check({ recordType: 'sales.deal', patch: {} }),
    ).rejects.toMatchObject(notAllowed);
    await expect(
      hr.dataValues.check({ recordType: 'core.customer', patch: {} }),
    ).rejects.toMatchObject(notAllowed);
    await expect(
      t.owner().dataValues.check({ recordType: 'hr.employee', patch: {} }),
    ).rejects.toMatchObject({ status: 403 });
    // Only admins change the score.
    await expect(
      hr.dataValues.check({ recordType: 'hr.employee', patch, userId: t.ids.member }),
    ).rejects.toMatchObject(notAllowed);
    await expect(
      hr.dataValues.check({ recordType: 'hr.employee', patch, userId: t.ids.owner }),
    ).resolves.toEqual({ values: patch });
  });

  it('reads a plugin record’s values from its view, with its formulas', async () => {
    await saveCustomFields('e1', byId(saved));

    const values = { ...saved, rank: 'HIGH 30' };

    await expect(
      t.member().dataValues.get({ recordType: 'hr.employee', recordId: 'e1' }),
    ).resolves.toEqual({
      recordType: 'hr.employee',
      recordId: 'e1',
      values,
      updatedBy: null,
      updatedAt: null,
    });
    expect(
      (await t.hr().dataValues.lookup({ recordType: 'hr.employee', recordIds: ['e1'] })).data,
    ).toMatchObject([{ recordId: 'e1', values }]);
  });

  it('links core’s records and a plugin’s, each link kept by the side that holds it', async () => {
    const owner = t.owner();
    const hr = t.hr();
    const customer = await owner.customers.create({ firstName: 'Anu', primaryEmail: 'a@mail.mn' });

    customerId = customer.id;

    // HR keeps an employee's client, and the customers it serves (many to many).
    const { field: client } = await owner.dataFields.relate({
      recordType: 'hr.employee',
      key: 'client',
      label: 'Client',
      targetRecordType: 'core.customer',
      kind: 'manyToOne',
      inverseKey: 'employees',
      inverseLabel: 'Employees',
    });

    const { inverse: serves } = await owner.dataFields.relate({
      recordType: 'core.customer',
      key: 'crew',
      label: 'Crew',
      targetRecordType: 'hr.employee',
      kind: 'manyToMany',
      inverseKey: 'serves',
      inverseLabel: 'Serves',
    });

    await owner.dataFields.create({
      recordType: 'core.customer',
      key: 'teamScore',
      label: 'Team score',
      type: 'rollup',
      settings: { rollup: { relation: 'employees', op: 'sum', field: 'score' } },
    });
    await expect(
      hr.dataValues.check({ recordType: 'hr.employee', patch: { [client.id]: 'nope' } }),
    ).rejects.toMatchObject({ code: 'INVALID_REFERENCE' });

    const checked = await hr.dataValues.check({
      recordType: 'hr.employee',
      current: byId(saved),
      patch: { [client.id]: customerId, [serves.id]: [customerId] },
    });

    await saveCustomFields('e1', checked.values);
    await expect(
      owner.dataValues.get({ recordType: 'core.customer', recordId: customerId }),
    ).resolves.toMatchObject({ values: { employees: ['e1'], crew: ['e1'], teamScore: 3 } });
    await expect(
      owner.dataValues.get({ recordType: 'hr.employee', recordId: 'e1' }),
    ).resolves.toMatchObject({ values: { client: customerId, serves: [customerId] } });
    // HR's records hold these links, so the customer's side doesn't write them.
    await expect(
      owner.dataValues.update({
        recordType: 'core.customer',
        recordId: customerId,
        values: { crew: [] },
      }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });
  });

  it('clears the links core keeps to the records a plugin says are gone', async () => {
    const owner = t.owner();
    const hr = t.hr();

    // Core keeps a customer's mentor, one of HR's employees.
    await owner.dataFields.relate({
      recordType: 'core.customer',
      key: 'mentor',
      label: 'Mentor',
      targetRecordType: 'hr.employee',
      kind: 'manyToOne',
      inverseKey: 'mentees',
      inverseLabel: 'Mentees',
    });
    await owner.dataValues.update({
      recordType: 'core.customer',
      recordId: customerId,
      values: { mentor: 'e1' },
    });
    await expect(
      owner.dataValues.get({ recordType: 'hr.employee', recordId: 'e1' }),
    ).resolves.toMatchObject({ values: { mentees: [customerId] } });
    await expect(
      owner.dataChanges.remove({ recordType: 'hr.employee', recordIds: ['e1'] }),
    ).rejects.toMatchObject({ status: 403 });
    await expect(
      hr.dataChanges.remove({ recordType: 'core.customer', recordIds: ['e1'] }),
    ).rejects.toMatchObject({ code: 'INVALID_REFERENCE' });
    await expect(
      hr.dataChanges.remove({ recordType: 'hr.employee', recordIds: ['e1'] }),
    ).resolves.toEqual({ removed: 1 });
    // The links HR's record holds are HR's to change.
    await expect(
      owner.dataValues.get({ recordType: 'core.customer', recordId: customerId }),
    ).resolves.toMatchObject({ values: { mentor: null, employees: ['e1'] } });
  });
});
