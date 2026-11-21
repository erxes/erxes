import { describe, expect, it } from 'vite-plus/test';
import { FIELDS, ORG, useOldPropertiesDatabase } from './propertiesCopy.fixture';

/**
 * 0107 copies old custom properties into Data Extensions with the same ids, and 0108 drops
 * them: on a database that had them before those migrations ran.
 */
describe('copying custom properties into Data Extensions', { timeout: 300_000 }, () => {
  const rows = useOldPropertiesDatabase();

  it('copies fields with their ids, keys, types, options and settings', async () => {
    const fields = await rows(
      `select id, record_type as "recordType", key, type, options, settings, group_id as "groupId",
        plugin, position, status, description, icon from core_data_fields order by id`,
    );

    const byId = Object.fromEntries(fields.map((row) => [String(row.id), row]));

    expect(fields).toHaveLength(FIELDS.length);
    expect(byId.fNick).toMatchObject({
      recordType: 'core.customer',
      key: 'nickname',
      type: 'text',
      groupId: 'gContact',
      position: 3,
    });
    expect(byId.fNick?.settings).toEqual({});
    expect(byId.fEmail).toMatchObject({
      key: 'workEmail',
      type: 'email',
      settings: { required: true },
    });
    expect(byId.fBudget).toMatchObject({ key: 'budget2', type: 'number' });
    expect(byId.fSince).toMatchObject({ type: 'date' });
    expect(byId.fNotes).toMatchObject({
      type: 'longText',
      description: 'Anything',
      icon: 'IconNotes',
    });
    expect(byId.fVip).toMatchObject({ type: 'boolean', settings: { hidden: true } });
    expect(byId.fTier).toMatchObject({
      type: 'select',
      options: [
        { value: 'Gold  VIP', label: 'Gold, VIP', color: 'gray' },
        { value: 'Silver', label: 'Silver', color: 'gray' },
      ],
    });
    expect(byId.fSize?.type).toBe('select');
    expect(byId.fTopics?.type).toBe('multiSelect');
    expect(byId.fChecks).toMatchObject({
      type: 'multiSelect',
      settings: { showInCreate: false },
    });
    expect(byId.fPhone).toMatchObject({ type: 'phone', settings: { filterable: false } });
    expect(byId.fTags?.type).toBe('textList');
    expect(byId.fFirst?.key).toBe('firstName2');
    expect(byId.fSpent).toMatchObject({
      key: 'total_spent',
      plugin: 'shop',
      settings: { readOnly: true },
    });
    expect(byId.fSector).toMatchObject({ recordType: 'core.company', type: 'select' });
    expect(byId.fWeight).toMatchObject({ recordType: 'core.product', type: 'number' });
    expect(byId.fShift).toMatchObject({ recordType: 'hr.employee', groupId: 'gTeam' });
  });

  it('copies groups', async () => {
    const groups = await rows(
      `select id, record_type as "recordType", label, code, position, applies_to as "appliesTo",
        archived_at is not null as archived from core_data_field_groups order by id`,
    );

    expect(groups).toEqual([
      {
        id: 'gContact',
        recordType: 'core.customer',
        label: 'Contact',
        code: 'contact',
        position: 2,
        appliesTo: {},
        archived: false,
      },
      {
        id: 'gTeam',
        recordType: 'hr.employee',
        label: 'Team',
        code: 'team',
        position: 0,
        appliesTo: { team: ['t1'] },
        archived: true,
      },
    ]);
  });

  it('turns logic into conditions on the fields’ keys', async () => {
    const [shown, hidden] = await rows(
      `select settings->'visibleWhen' as condition from core_data_fields where id = 'fShown'
       union all select settings->'hiddenWhen' from core_data_fields where id = 'fHidden'`,
    );

    expect(shown?.condition).toEqual({
      match: 'all',
      rules: [
        { field: 'tier', operator: 'eq', value: 'Silver' },
        { field: 'score', operator: 'greaterThan', value: 5 },
      ],
    });
    expect(hidden?.condition).toEqual({
      match: 'all',
      rules: [{ field: 'vip', operator: 'isNotEmpty' }],
    });
  });

  it('copies core records’ values into their tables, dropping those that don’t fit', async () => {
    const tables = await rows(
      `select record_type as "recordType", table_name as "tableName", kind from core_data_tables order by record_type`,
    );

    expect(tables).toEqual([
      { recordType: 'core.company', tableName: 'ext_core_company', kind: 'host' },
      { recordType: 'core.customer', tableName: 'ext_core_customer', kind: 'host' },
      { recordType: 'core.product', tableName: 'ext_core_product', kind: 'host' },
    ]);

    const customers = await rows(
      `select *, client_since::text as since, joined::text as joined
        from "data_${ORG}".ext_core_customer order by record_id`,
    );

    expect(customers[0]).toMatchObject({
      record_id: 'c1',
      nickname: 'Bob',
      work_email: 'bob@example.com',
      budget2: '1.5',
      notes: 'Long notes',
      score: '7',
      vip: true,
      tier: 'Gold  VIP',
      size: 'M',
      topics: ['b', 'a'],
      desk_phone: '+976 9911 2233',
      aliases: ['Bobby', 'B'],
      total_spent: '120',
      since: '2020-02-03',
      joined: '1990-05-06',
    });
    expect(customers[1]).toMatchObject({
      record_id: 'c2',
      work_email: null,
      budget2: null,
      tier: null,
      checks: ['y'],
    });
    // A binned customer's values, from its recycle bin snapshot.
    expect(customers[2]).toMatchObject({
      record_id: 'c9',
      nickname: 'Binned',
      topics: ['c', 'a'],
      score: '3',
    });
    expect(customers).toHaveLength(3);

    const [company] = await rows(`select * from "data_${ORG}".ext_core_company`);
    const [product] = await rows(`select * from "data_${ORG}".ext_core_product`);

    expect(company).toMatchObject({ record_id: 'co1', sector: 'Retail' });
    expect(product).toMatchObject({ record_id: 'p1', weight: '250' });
  });

  it('names the fields by their keys in views, automations, imports and exports', async () => {
    const [view] = await rows(`select filter, columns, sort from core_views`);
    const [automation] = await rows(`select definition from core_automations`);
    const [imported] = await rows(`select mapping from core_imports`);
    const [exported] = await rows(`select columns, query from core_exports`);

    const filter = {
      match: 'all',
      rules: [
        { path: 'subject.data.tier', op: 'eq', value: 'Silver' },
        { path: 'subject.company.data.sector', op: 'eq', value: 'Retail' },
      ],
    };

    expect(view).toEqual({
      filter,
      columns: ['firstName', 'data.nickname'],
      sort: { field: 'data.score', direction: 'asc' },
    });
    expect(automation?.definition).toEqual({
      trigger: { kind: 'date', subject: 'customer', field: 'data.joined', offsetDays: 0 },
      steps: [
        {
          id: 's1',
          type: 'action',
          action: 'core.customer.set_data_value',
          input: { field: 'nickname', value: 'Hi {{subject.data.nickname}}' },
        },
      ],
    });
    expect(imported?.mapping).toEqual({ '0': 'firstName', '1': 'data.nickname' });
    expect(exported).toEqual({ columns: ['data.score'], query: { filter } });
  });

  it('drops the old tables and its helpers', async () => {
    const left = await rows(
      `select tablename from pg_tables where schemaname = 'public'
        and tablename in ('core_fields', 'core_field_groups', 'core_customer_field_values')
       union all select proname from pg_proc where proname like 'core\\_props\\_%'`,
    );

    expect(left).toEqual([]);
  });
});
