import { closeDb, configureDb, Journal, runMigrations } from '@erxes/core-db';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { Client } from 'pg';
import { afterAll, beforeAll } from 'vite-plus/test';
import { z } from 'zod';
import { randomToken } from '~/lib/crypto';
import { inOrder } from '~/lib/sequence';
import { admin, databaseUrl, dropDatabase, testServerUrl } from './globalSetup';

const DRIZZLE = resolve(import.meta.dirname, '../../../../packages/db/drizzle');
const LAST_OLD = '0147_data_field_groups';

export const ORG = 'orgPropsCopy01';

/** drizzle-kit's journal, its entries kept whole. */
const FullJournal = z.looseObject({ entries: z.array(z.looseObject({ tag: z.string() })) });

/** A row as a test reads it. */
const Row = z.record(z.string(), z.unknown());

/** A copy of the migrations up to `LAST_OLD`. */
const oldMigrations = async () => {
  const folder = await mkdtemp(join(tmpdir(), 'core-props-'));

  const journal = FullJournal.parse(
    JSON.parse(await readFile(join(DRIZZLE, 'meta', '_journal.json'), 'utf8')),
  );

  const { entries } = Journal.parse(journal);
  const kept = entries.slice(0, entries.findIndex((entry) => entry.tag === LAST_OLD) + 1);

  await mkdir(join(folder, 'meta'));
  await writeFile(
    join(folder, 'meta', '_journal.json'),
    JSON.stringify({ ...journal, entries: journal.entries.slice(0, kept.length) }),
  );
  await Promise.all(
    kept.map(({ tag }) => copyFile(join(DRIZZLE, `${tag}.sql`), join(folder, `${tag}.sql`))),
  );

  return folder;
};

/** An old custom field, as `core_fields` held it. */
interface OldField {
  id: string;
  type: string;
  label: string;
  contentType: string;
  code?: string;
  validation?: string;
  options?: string[];
  isVisible?: boolean;
  isRequired?: boolean;
  isVisibleToCreate?: boolean;
  logic?: { action: string; rules: { fieldId: string; operator: string; value: string | null }[] };
  filterable?: boolean;
  order?: number;
  groupId?: string;
  plugin?: string;
  description?: string;
  icon?: string;
  customerEditable?: boolean;
}

const field = (
  id: string,
  type: string,
  label: string,
  extra: Partial<OldField> = {},
  contentType = 'customer',
): OldField => ({ id, type, label, contentType, ...extra });

export const FIELDS = [
  field('fNick', 'text', 'Nickname', { code: 'nickname', groupId: 'gContact', order: 3 }),
  field('fEmail', 'text', 'Work email', { validation: 'email', isRequired: true }),
  field('fBudget', 'text', 'Budget', { code: 'Budget-2', validation: 'number' }),
  field('fSince', 'text', 'Client since', { validation: 'date' }),
  field('fNotes', 'textarea', 'Notes', { description: 'Anything', icon: 'IconNotes' }),
  field('fScore', 'number', 'Score', { customerEditable: true }),
  field('fBorn', 'date', 'Joined'),
  field('fVip', 'boolean', 'VIP', { isVisible: false }),
  field('fTier', 'select', 'Tier', { options: ['Gold, VIP', 'Silver'] }),
  field('fSize', 'radio', 'Size', { options: ['S', 'M'] }),
  field('fTopics', 'multiselect', 'Topics', { options: ['a', 'b', 'c'] }),
  field('fChecks', 'check', 'Checks', { options: ['x', 'y'], isVisibleToCreate: false }),
  field('fPhone', 'phone', 'Desk phone', { filterable: false }),
  field('fTags', 'list', 'Aliases'),
  field('fFirst', 'text', 'First', { code: 'firstName' }),
  field('fShown', 'text', 'Shown', {
    logic: {
      action: 'show',
      rules: [
        { fieldId: 'fTier', operator: 'is', value: 'Silver' },
        { fieldId: 'fScore', operator: 'greaterThan', value: '5' },
        { fieldId: 'fGone', operator: 'is', value: 'x' },
      ],
    },
  }),
  field('fHidden', 'text', 'Hidden', {
    logic: { action: 'hide', rules: [{ fieldId: 'fVip', operator: 'hasValue', value: null }] },
  }),
  field('fSpent', 'number', 'Total spent', { code: 'total_spent', plugin: 'shop' }),
  field('fSector', 'select', 'Sector', { options: ['Retail'] }, 'company'),
  field('fWeight', 'number', 'Weight', {}, 'product'),
  field('fShift', 'text', 'Shift', { groupId: 'gTeam' }, 'hr.employee'),
];

/** Old values: [field, record, position, column, value]. */
const VALUES: [string, string, number, string, unknown][] = [
  ['fNick', 'c1', 0, 'text_value', ' Bob '],
  ['fEmail', 'c1', 0, 'text_value', 'Bob@Example.com'],
  ['fEmail', 'c2', 0, 'text_value', 'not an email'],
  ['fBudget', 'c1', 0, 'text_value', '1,5'],
  ['fBudget', 'c2', 0, 'text_value', 'lots'],
  ['fSince', 'c1', 0, 'text_value', '2020-02-03'],
  ['fNotes', 'c1', 0, 'text_value', 'Long notes'],
  ['fScore', 'c1', 0, 'number_value', 7],
  ['fBorn', 'c1', 0, 'date_value', '1990-05-06'],
  ['fVip', 'c1', 0, 'bool_value', true],
  ['fTier', 'c1', 0, 'text_value', 'Gold, VIP'],
  ['fTier', 'c2', 0, 'text_value', 'Bronze'],
  ['fSize', 'c1', 0, 'text_value', 'M'],
  ['fTopics', 'c1', 0, 'text_value', 'b'],
  ['fTopics', 'c1', 1, 'text_value', 'a'],
  ['fTopics', 'c1', 2, 'text_value', 'zz'],
  ['fChecks', 'c2', 0, 'text_value', 'y'],
  ['fPhone', 'c1', 0, 'text_value', '+976 9911 2233'],
  ['fTags', 'c1', 0, 'text_value', 'Bobby'],
  ['fTags', 'c1', 1, 'text_value', 'B'],
  ['fSpent', 'c1', 0, 'number_value', 120],
  ['fSector', 'co1', 0, 'text_value', 'Retail'],
  ['fWeight', 'p1', 0, 'number_value', 250],
];

const VALUE_TABLES: Record<string, string> = {
  c1: 'core_customer_field_values',
  c2: 'core_customer_field_values',
  co1: 'core_company_field_values',
  p1: 'core_product_field_values',
};

const OLD_FILTER = {
  match: 'all',
  rules: [
    { path: 'subject.customFields.fTier', op: 'eq', value: 'Silver' },
    { path: 'subject.company.customFields.fSector', op: 'eq', value: 'Retail' },
  ],
};

const DEFINITION = {
  trigger: { kind: 'date', subject: 'customer', field: 'fBorn', offsetDays: 0 },
  steps: [
    {
      id: 's1',
      type: 'action',
      action: 'core.customer.set_field',
      input: { fieldId: 'fNick', value: 'Hi {{subject.customFields.fNick}}' },
    },
  ],
};

const BINNED = {
  row: { id: 'c9', customFields: { fNick: 'Binned', fTopics: ['c', 'a'], fScore: 3 } },
  tagIds: [],
  links: [],
  activities: [],
  notes: [],
  noteVersions: [],
  reactions: [],
};

const fieldRow = (row: OldField) => [
  row.id,
  ORG,
  row.contentType,
  row.label,
  row.code ?? null,
  row.type,
  row.validation ?? null,
  row.options ?? [],
  row.isVisible ?? true,
  row.isRequired ?? false,
  row.isVisibleToCreate ?? true,
  row.logic ? JSON.stringify(row.logic) : null,
  row.filterable ?? true,
  row.order ?? 0,
  row.groupId ?? null,
  row.plugin ?? null,
  row.description ?? null,
  row.icon ?? null,
  row.customerEditable ?? false,
];

/** One organisation's old properties: records, groups, fields, values and the stored paths. */
const seed = async (client: Client) => {
  const q = (text: string, values: unknown[] = []) => client.query(text, values);

  await q(`insert into core_organizations (id, subdomain, name) values ($1, 'props', 'Props')`, [
    ORG,
  ]);
  await q(`insert into core_plugins (name) values ('shop')`);
  await q(`insert into core_customers (id, org_id) values ('c1', $1), ('c2', $1)`, [ORG]);
  await q(`insert into core_companies (id, org_id, primary_name) values ('co1', $1, 'Acme')`, [
    ORG,
  ]);
  await q(
    `insert into core_products (id, org_id, kind, name, currency) values ('p1', $1, 'goods', 'Box', 'MNT')`,
    [ORG],
  );
  await q(
    `insert into core_field_groups (id, org_id, content_type, name, code, "order", applies_to, archived_at) values
      ('gContact', $1, 'customer', 'Contact', 'contact', 2, '{}', null),
      ('gTeam', $1, 'hr.employee', 'Team', 'team', 0, '{"team":["t1"]}', now())`,
    [ORG],
  );
  await inOrder(FIELDS, (row) =>
    q(
      `insert into core_fields (id, org_id, content_type, label, code, type, validation, options,
          is_visible, is_required, is_visible_to_create, logic, filterable, "order", group_id,
          plugin, description, icon, customer_editable)
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
          $19)`,
      fieldRow(row),
    ),
  );
  await inOrder(VALUES, ([fieldId, recordId, position, column, value]) =>
    q(
      `insert into ${VALUE_TABLES[recordId]} (org_id, record_id, field_id, position, ${column})
        values ($1, $2, $3, $4, $5)`,
      [ORG, recordId, fieldId, position, value],
    ),
  );
  await q(
    `insert into core_views (id, org_id, record_type, name, filter, columns, sort, created_by)
      values ('v1', $1, 'customer', 'VIPs', $2, $3, $4, 'u1')`,
    [
      ORG,
      JSON.stringify(OLD_FILTER),
      JSON.stringify(['firstName', 'field:fNick']),
      JSON.stringify({ field: 'customFields.fScore', direction: 'asc' }),
    ],
  );
  await q(
    `insert into core_automations (id, org_id, name, definition, trigger_event)
      values ('a1', $1, 'Birthday', $2, 'date')`,
    [ORG, JSON.stringify(DEFINITION)],
  );
  await q(
    `insert into core_imports (id, org_id, record_type, file_id, file_name, options, mapping, created_by)
      values ('i1', $1, 'customer', 'file1', 'people.csv', '{}', $2, 'u1')`,
    [ORG, JSON.stringify({ '0': 'firstName', '1': 'customFields.fNick' })],
  );
  await q(
    `insert into core_exports (id, org_id, record_type, format, columns, query, created_by)
      values ('e1', $1, 'customer', 'csv', $2, $3, 'u1')`,
    [ORG, JSON.stringify(['customFields.fScore']), JSON.stringify({ filter: OLD_FILTER })],
  );
  await q(
    `insert into core_trash (id, org_id, record_type, record_id, snapshot, deleted_by_type, purge_at)
      values ('t1', $1, 'customer', 'c9', $2, 'system', now() + interval '30 days')`,
    [ORG, JSON.stringify(BINNED)],
  );
};

/**
 * A fresh database migrated up to 0106, seeded with old properties, then migrated the rest of
 * the way; the returned `rows` reads it as its owner.
 */
export const useOldPropertiesDatabase = () => {
  const name = `core_test_props_${randomToken(4, 'hex')}`;
  const server = testServerUrl();
  let client: Client | null = null;
  let folder = '';

  beforeAll(async () => {
    await admin(server, `CREATE DATABASE ${name}`);
    configureDb({ url: databaseUrl(server, name), applicationName: 'erxes-core-test-props' });
    folder = await oldMigrations();
    await runMigrations({}, folder);

    client = new Client({ connectionString: databaseUrl(server, name) });
    await client.connect();
    await seed(client);
    await runMigrations({});
  });

  afterAll(async () => {
    await client?.end();
    await closeDb();
    await rm(folder, { recursive: true, force: true });
    await dropDatabase(server, name);
  });

  return async (text: string) => {
    if (!client) throw new Error('rows() runs inside the tests');

    return z.array(Row).parse((await client.query(text)).rows);
  };
};
