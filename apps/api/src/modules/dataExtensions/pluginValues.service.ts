import { type AppliesTo, DataExtensionValues, groupApplies } from '@erxes/core-contract';
import { type Caller, caller, dataFieldGroups, type Db, roles, runAs, users } from '@erxes/core-db';
import { and, eq, sql } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { objectsPlugins } from '~/modules/recordTypes/recordTypes.service';
import { pluginOf } from './columns';
import { type DataFieldRow, fieldsOf } from './definitions';
import { relationSides } from './relationValues';
import { prepareValues, type ValuePath } from './values';
import { askedBy, assertRequired } from './writeRules';

/**
 * A plugin keeps its records' Data Extensions values itself, in a `custom_fields` map by field
 * id, so it can filter and sort its lists by them. Before it saves a record it asks core to
 * check them, with the rules core applies to its own records' values.
 */

type Values = Record<string, unknown>;

/** 403 NOT_ALLOWED unless the caller is the plugin that keeps `recordType`'s records. */
const assertOwnType = async (client: Db, recordType: string) => {
  const who = caller();
  const plugin = pluginOf(recordType);

  if (who.type !== 'plugin' || !plugin || who.plugin !== plugin) {
    throw fail('NOT_ALLOWED', `Only ${plugin ?? 'core'} checks ${recordType}’s values`);
  }

  const owner = (await objectsPlugins(client)).find((row) => row.plugin === plugin);

  if (!owner?.objects.some((object) => object.type === recordType)) {
    throw fail('INVALID_REFERENCE', `${recordType} is not a record type here`, {
      field: 'recordType',
    });
  }
};

/** The member a plugin checks for, as a caller: their role decides what they may change. */
const memberCaller = async (client: Db, userId: string): Promise<Caller> => {
  const [member] = await client
    .select({ role: users.role, permissions: roles.permissions })
    .from(users)
    .innerJoin(roles, eq(roles.key, users.role))
    .where(and(eq(users.id, userId), eq(users.status, 'active')))
    .limit(1);

  if (!member) {
    throw fail('INVALID_REFERENCE', `${userId} is not a member here`, { field: 'userId' });
  }

  return { type: 'user', userId, role: member.role, permissions: member.permissions };
};

/** Values by field id as values by key, leaving out ids that are no active field's. */
const byKey = (fields: Map<string, DataFieldRow>, values: Values) =>
  Object.fromEntries(
    Object.entries(values).flatMap(([id, value]) => {
      const field = fields.get(id);

      return field ? [[field.key, value]] : [];
    }),
  );

const AT_PATCH: ValuePath = (field) => ['patch', field.id];

/**
 * The record type's active fields that apply to a record in `appliesTo` (`{ team: [id] }`):
 * those outside a group, or in one whose `appliesTo` the record meets.
 */
const applyingFields = async (client: Db, recordType: string, appliesTo: AppliesTo) => {
  const fields = await fieldsOf(client, recordType);

  const limited = await client
    .select({ id: dataFieldGroups.id, appliesTo: dataFieldGroups.appliesTo })
    .from(dataFieldGroups)
    .where(
      and(
        eq(dataFieldGroups.recordType, recordType),
        sql`${dataFieldGroups.appliesTo} <> '{}'::jsonb`,
      ),
    );

  const skipped = new Set(
    limited.filter((group) => !groupApplies(group.appliesTo, appliesTo)).map((group) => group.id),
  );

  return fields.filter((field) => !field.groupId || !skipped.has(field.groupId));
};

/**
 * A plugin's record's values after `patch` (null clears one), checked against the record
 * type's active fields and their rules: what the plugin then saves. `current` is what the
 * record holds; values of ids that are no active field's stay as they are. With `create`,
 * every value is checked and defaults fill the rest; with `userId`, that member's role must
 * be allowed to change what the patch changes. 400 INVALID_INPUT names each value that isn't
 * valid, 403 NOT_ALLOWED for another's record type.
 */
export const checkValues = async (
  client: Db,
  input: {
    recordType: string;
    current: Values;
    patch: Values;
    create?: boolean;
    userId?: string;
    appliesTo?: Record<string, string[]>;
  },
) => {
  await assertOwnType(client, input.recordType);

  const fields = await applyingFields(client, input.recordType, input.appliesTo ?? {});
  const byId = new Map(fields.map((field) => [field.id, field]));
  const unknown = Object.keys(input.patch).filter((id) => !byId.has(id));

  if (unknown.length) {
    throw fail('INVALID_INPUT', 'Some values are not valid', {
      issues: unknown.map((id) => ({
        path: ['patch', id],
        message: 'No active field of a group that applies to this record has this id',
      })),
    });
  }

  const sides = await relationSides(client, fields);
  const create = input.create === true;
  const written = byKey(byId, create ? { ...input.current, ...input.patch } : input.patch);
  const check = () => prepareValues(client, fields, sides, written, create, AT_PATCH);

  const prepared = input.userId
    ? await runAs(await memberCaller(client, input.userId), check)
    : await check();

  const changed = new Map(
    fields.flatMap((field) =>
      field.key in prepared.values ? [[field.id, prepared.values[field.key] ?? null] as const] : [],
    ),
  );

  const values = Object.fromEntries([
    ...Object.entries(input.current).filter(([id]) => !changed.has(id)),
    ...[...changed].filter(([, value]) => value !== null),
  ]);

  assertRequired(
    fields,
    Object.fromEntries(fields.map((field) => [field.key, values[field.id] ?? null])),
    askedBy(Object.keys(written), create),
    AT_PATCH,
  );

  return { values: DataExtensionValues.parse(values) };
};
