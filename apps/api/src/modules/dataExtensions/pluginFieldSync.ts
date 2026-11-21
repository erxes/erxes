import {
  type DataFieldOption,
  type Db,
  dataFields,
  newId,
  pluginInstallations,
  type StoredPluginManifest,
  withOrg,
} from '@erxes/core-db';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { logger } from '~/logger';
import { inOrder } from '~/lib/sequence';
import { columnsOf, freeColumn } from './columns';
import { addColumns, changeSchema, dropColumns } from './ddl';
import { type DataFieldRow, ensureTable, tableOf } from './definitions';
import { nextPosition, takenColumns } from './fieldRules';
import { clearDropped } from './fieldUpdate';

/**
 * A plugin's manifest `fields` as Data Extensions fields on customers and companies, owned by
 * the plugin: members read them, the plugin writes them (`dataValues.setPluginValues`). Each
 * keeps its manifest `code` as its key.
 */

type DeclaredField = NonNullable<StoredPluginManifest['fields']>[number];

const log = logger.child({ component: 'data-plugin-fields' });

/** Core's record type a manifest field is on. */
export const PLUGIN_FIELD_RECORD_TYPES = {
  customer: 'core.customer',
  company: 'core.company',
} as const;

const TYPES = {
  number: 'number',
  date: 'date',
  text: 'text',
  select: 'select',
  multiselect: 'multiSelect',
} as const satisfies Record<DeclaredField['type'], DataFieldRow['type']>;

/**
 * A manifest's options as a select's: each text is its value and label. Characters a value
 * can't hold (`, { } " \`) become spaces in the value; the label keeps them.
 */
const pluginOptions = (options: string[] = []): DataFieldOption[] => {
  const seen = new Set<string>();

  return options.flatMap((text) => {
    const value = text
      .replaceAll(/[,{}"\\]/g, ' ')
      .trim()
      .slice(0, 100);

    if (!value || seen.has(value)) return [];

    seen.add(value);

    return [{ value, label: text.slice(0, 120), color: 'gray' as const }];
  });
};

/** A manifest field as the definition its Data Extensions field takes. */
const definitionOf = (declared: DeclaredField) => ({
  recordType: PLUGIN_FIELD_RECORD_TYPES[declared.contentType],
  key: declared.code,
  label: declared.label.slice(0, 120),
  description: declared.description?.slice(0, 500) ?? null,
  type: TYPES[declared.type],
  options:
    declared.type === 'select' || declared.type === 'multiselect'
      ? pluginOptions(declared.options)
      : [],
  settings: { readOnly: true, filterable: declared.filterable ?? true },
});

type Definition = ReturnType<typeof definitionOf>;

/** A new field's row and its column in the record type's table. */
const addField = async (client: Db, plugin: string, definition: Definition) => {
  const [taken] = await client
    .select({ id: dataFields.id })
    .from(dataFields)
    .where(
      and(eq(dataFields.recordType, definition.recordType), eq(dataFields.key, definition.key)),
    )
    .limit(1);

  // A member's field, or another plugin's, has the key already: it stays theirs.
  if (taken) {
    log.warn(
      { plugin, recordType: definition.recordType, key: definition.key },
      'another field has the key of a plugin’s field; the plugin’s is left out here',
    );

    return;
  }

  const [row] = await client
    .insert(dataFields)
    .values({
      ...definition,
      id: newId(),
      plugin,
      column: freeColumn(definition.key, await takenColumns(client, definition.recordType)),
      position: await nextPosition(client, definition.recordType),
    })
    .returning();

  if (row) await addStorage(client, row);
};

const addStorage = (client: Db, field: DataFieldRow) =>
  changeSchema(client, async () => {
    await addColumns(client, await ensureTable(client, field.recordType), columnsOf(field));
  });

/** A field whose manifest changed: its definition follows, and a new type clears its values. */
const changeField = async (client: Db, field: DataFieldRow, definition: Definition) => {
  const retyped = field.type !== definition.type;

  if (retyped) {
    const table = await tableOf(client, field.recordType);

    if (table) await changeSchema(client, () => dropColumns(client, table, columnsOf(field)));
  } else {
    // Values of options the manifest dropped are cleared, as a member's select clears them.
    await clearDropped(client, field, definition.options);
  }

  const [row] = await client
    .update(dataFields)
    .set({
      label: definition.label,
      description: definition.description,
      type: definition.type,
      options: definition.options,
      settings: { ...field.settings, ...definition.settings },
      status: 'active',
      updatedAt: sql`now()`,
    })
    .where(eq(dataFields.id, field.id))
    .returning();

  if (row && retyped) await addStorage(client, row);
};

/** One organisation's fields of the plugin, in line with its manifest. */
const syncOrg = async (client: Db, plugin: string, declared: DeclaredField[]) => {
  const existing = await client.select().from(dataFields).where(eq(dataFields.plugin, plugin));
  const definitions = declared.map(definitionOf);

  const at = (recordType: string, key: string) =>
    existing.find((field) => field.recordType === recordType && field.key === key);

  await inOrder(definitions, (definition) => {
    const field = at(definition.recordType, definition.key);

    return field ? changeField(client, field, definition) : addField(client, plugin, definition);
  });

  const kept = new Set(
    definitions.map((definition) => `${definition.recordType}:${definition.key}`),
  );

  const dropped = existing.filter(
    (field) => field.status === 'active' && !kept.has(`${field.recordType}:${field.key}`),
  );

  if (dropped.length) {
    await client
      .update(dataFields)
      .set({ status: 'archived', updatedAt: sql`now()` })
      .where(
        inArray(
          dataFields.id,
          dropped.map((field) => field.id),
        ),
      );
  }
};

/**
 * Brings the plugin's Data Extensions fields in line with its manifest in every organisation
 * the scope sees that has it installed (one inside `withOrg`): new ones are made, changed ones
 * follow, dropped ones are archived with their values and come back when the manifest names
 * them again. A changed type clears the field's values; the plugin writes them again.
 */
export const syncPluginDataFields = async (
  client: Db,
  plugin: string,
  declared: DeclaredField[] = [],
) => {
  const installed = await client
    .select({ orgId: pluginInstallations.orgId })
    .from(pluginInstallations)
    .where(eq(pluginInstallations.plugin, plugin));

  await inOrder(installed, ({ orgId }) =>
    withOrg(orgId, (scoped) => syncOrg(scoped, plugin, declared)),
  );
};
