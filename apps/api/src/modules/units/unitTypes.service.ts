import { type Db, newId, orgUnits, orgUnitTypes, plugins } from '@erxes/core-db';
import { and, asc, eq, getTableColumns, inArray, isNull, ne, sql } from 'drizzle-orm';
import { fail, notFound } from '~/http/errors';
import { unique } from '~/lib/contacts';
import { wholeList } from '~/lib/keyset';
import { oneRow } from '~/lib/rows';
import { publishCoreEvents } from '~/modules/events/events.service';
import { typeHidden } from './unitRows';

type StoredType = typeof orgUnitTypes.$inferSelect;

export type UnitTypeRow = StoredType & { pluginTitle: string | null; hidden: boolean };

export interface UnitTypeFields {
  name?: string;
  code?: string | null;
  description?: string | null;
  color?: string;
  icon?: string | null;
  canBeRoot?: boolean;
  allowedParentTypeIds?: string[];
  isActive?: boolean;
  sortOrder?: number;
}

/** What every organisation starts with, named as old erxes named them. */
const DEFAULT_TYPES = [
  { name: 'Branch', code: 'branch', color: '#0ea5e9', icon: 'IconBuildingStore', sortOrder: 0 },
  { name: 'Department', code: 'department', color: '#6366f1', icon: 'IconSitemap', sortOrder: 1 },
] as const;

export const seedStructure = async (tx: Db, orgId: string) => {
  const id = newId();

  await tx
    .insert(orgUnitTypes)
    .values(DEFAULT_TYPES.map((type) => ({ ...type, id: newId(), orgId })));
  await tx.insert(orgUnits).values({ id, orgId, name: 'Organization', path: `/${id}/` });
};

const typeColumns = {
  ...getTableColumns(orgUnitTypes),
  pluginTitle: sql<
    string | null
  >`(select ${plugins.manifest} ->> 'title' from ${plugins} where ${plugins.name} = ${orgUnitTypes.plugin})`.as(
    'plugin_title',
  ),
  hidden: typeHidden(orgUnitTypes.plugin).as('hidden'),
};

const ordered = [asc(orgUnitTypes.sortOrder), asc(orgUnitTypes.createdAt), asc(orgUnitTypes.id)];

export const unitTypeRows = (client: Db): Promise<UnitTypeRow[]> =>
  wholeList((limit) =>
    client
      .select(typeColumns)
      .from(orgUnitTypes)
      .orderBy(...ordered)
      .limit(limit),
  );

export const findType = async (client: Db, id: string): Promise<UnitTypeRow> => {
  const [row] = await client.select(typeColumns).from(orgUnitTypes).where(eq(orgUnitTypes.id, id));

  if (!row) throw notFound('Unit type');

  return row;
};

const badType = (message: string) => fail('INVALID_REFERENCE', message, { field: 'typeId' });

const fits = (
  type: Pick<StoredType, 'canBeRoot' | 'allowedParentTypeIds'>,
  parentTypeId: string | null,
) =>
  parentTypeId === null
    ? type.canBeRoot
    : !type.allowedParentTypeIds.length || type.allowedParentTypeIds.includes(parentTypeId);

/**
 * The type a new unit gets: the named one, which must be active and not hidden, or the first
 * active type that may sit under the parent.
 */
export const typeForUnit = async (
  client: Db,
  typeId: string | undefined,
  parentTypeId: string | null,
) => {
  const usable = (await unitTypeRows(client)).filter((type) => type.isActive && !type.hidden);

  const found = typeId
    ? usable.find((type) => type.id === typeId)
    : usable.find((type) => fits(type, parentTypeId));

  if (!found) throw badType(typeId ? 'Not an active unit type' : 'No active unit type fits here');

  return found;
};

/** A unit of `type` may sit under a unit of `parentTypeId` (null: right under the organisation). */
export const assertPlacement = (
  type: Pick<StoredType, 'name' | 'canBeRoot' | 'allowedParentTypeIds'>,
  parentTypeId: string | null,
) => {
  if (fits(type, parentTypeId)) return;

  throw badType(
    parentTypeId === null
      ? `A ${type.name} can't sit right under the organisation`
      : `A ${type.name} can't sit under this unit`,
  );
};

/** The units directly under `unitId` may still sit under a unit of `typeId`. */
export const assertChildrenFit = async (client: Db, unitId: string, typeId: string) => {
  const misplaced = await client
    .select({ name: orgUnits.name })
    .from(orgUnits)
    .innerJoin(orgUnitTypes, eq(orgUnitTypes.id, orgUnits.typeId))
    .where(
      and(
        eq(orgUnits.parentId, unitId),
        sql`cardinality(${orgUnitTypes.allowedParentTypeIds}) > 0`,
        sql`not (${typeId} = any(${orgUnitTypes.allowedParentTypeIds}))`,
      ),
    )
    .limit(1);

  if (misplaced[0]) throw badType(`${misplaced[0].name} can't sit under a unit of this type`);
};

const assertParentTypes = async (client: Db, ids: string[] | undefined) => {
  const wanted = unique(ids ?? []);

  if (!wanted.length) return wanted;

  const found = await client.$count(orgUnitTypes, inArray(orgUnitTypes.id, wanted));

  if (found !== wanted.length) {
    throw fail('INVALID_REFERENCE', 'Not a unit type of this organisation', {
      field: 'allowedParentTypeIds',
    });
  }

  return wanted;
};

const assertOwn = (type: UnitTypeRow) => {
  if (type.plugin) {
    throw fail(
      'PLUGIN_UNIT_TYPE',
      `${type.name} comes from ${type.pluginTitle ?? type.plugin} and can't be changed here`,
      { typeId: type.id, plugin: type.plugin },
    );
  }
};

/** 409 unless another active type of the organisation's own stays. */
const assertAnotherActive = async (client: Db, type: UnitTypeRow) => {
  const others = await client.$count(
    orgUnitTypes,
    and(isNull(orgUnitTypes.plugin), eq(orgUnitTypes.isActive, true), ne(orgUnitTypes.id, type.id)),
  );

  if (!others) {
    throw fail('LAST_UNIT_TYPE', 'Keep at least one active unit type of your own');
  }
};

type TypeAction = 'type_created' | 'type_updated' | 'type_deleted';

const publishTypeEvents = (
  client: Db,
  action: TypeAction,
  changes: { id: string; changed?: string[] }[],
) =>
  publishCoreEvents(
    client,
    changes.map(({ id, changed }) => ({
      type: `core.unit.${action}`,
      entityType: 'unit_type',
      entityId: id,
      payload: { changed: changed ?? [] },
    })),
  );

export const createUnitType = async (
  client: Db,
  { allowedParentTypeIds, ...fields }: UnitTypeFields & { name: string },
) => {
  const parents = await assertParentTypes(client, allowedParentTypeIds);

  const row = oneRow(
    await client
      .insert(orgUnitTypes)
      .values({ ...fields, id: newId(), allowedParentTypeIds: parents })
      .returning({ id: orgUnitTypes.id }),
  );

  await publishTypeEvents(client, 'type_created', [row]);

  return findType(client, row.id);
};

export const updateUnitType = async (client: Db, id: string, fields: UnitTypeFields) => {
  const type = await findType(client, id);

  assertOwn(type);

  if (fields.isActive === false && type.isActive) await assertAnotherActive(client, type);

  const parents =
    fields.allowedParentTypeIds && (await assertParentTypes(client, fields.allowedParentTypeIds));

  await client
    .update(orgUnitTypes)
    .set({
      ...fields,
      ...(parents ? { allowedParentTypeIds: parents } : {}),
      updatedAt: sql`now()`,
    })
    .where(eq(orgUnitTypes.id, id));

  await publishTypeEvents(client, 'type_updated', [{ id, changed: Object.keys(fields) }]);

  return findType(client, id);
};

/** Deletes an unused type and drops it from the others' allowed parents. */
export const removeUnitType = async (client: Db, id: string) => {
  const type = await findType(client, id);

  assertOwn(type);

  const count = await client.$count(orgUnits, eq(orgUnits.typeId, id));

  if (count) {
    throw fail(
      'UNIT_TYPE_IN_USE',
      `${count} units are ${type.name}s: give them another type first`,
      { count },
    );
  }

  if (type.isActive) await assertAnotherActive(client, type);

  const pruned = await client
    .update(orgUnitTypes)
    .set({
      allowedParentTypeIds: sql`array_remove(${orgUnitTypes.allowedParentTypeIds}, ${id})`,
      updatedAt: sql`now()`,
    })
    .where(sql`${id} = any(${orgUnitTypes.allowedParentTypeIds})`)
    .returning({ id: orgUnitTypes.id });

  await client.delete(orgUnitTypes).where(eq(orgUnitTypes.id, id));
  await publishTypeEvents(client, 'type_deleted', [type]);
  await publishTypeEvents(
    client,
    'type_updated',
    pruned.map((row) => ({ id: row.id, changed: ['allowedParentTypeIds'] })),
  );

  return type;
};

export type ImportedUnitType = UnitTypeFields & { id: string; name: string };

const lower = (value: string | null | undefined) => value?.trim().toLowerCase() ?? null;

/** The organisation's own type an imported one is: same id, or same code, or same name. */
const sameType = (known: UnitTypeRow[], type: ImportedUnitType) =>
  known.find((other) => other.id === type.id) ??
  known.find(
    (other) =>
      !other.plugin &&
      (type.code ? lower(other.code) === lower(type.code) : lower(other.name) === lower(type.name)),
  );

/**
 * Brings a plugin's unit types in as the organisation's own, keeping their ids. One already here
 * merges into that one; allowed parents are mapped to what their types became and kept when they
 * are types here.
 */
export const importUnitTypes = async (client: Db, types: ImportedUnitType[]) => {
  const known = await unitTypeRows(client);
  const ids: Record<string, string> = {};
  const inserts: ImportedUnitType[] = [];

  for (const type of types) {
    const match = sameType(known, type);

    ids[type.id] = match?.id ?? type.id;

    if (!match) inserts.push(type);
  }

  const here = new Set([...known.map((type) => type.id), ...inserts.map((type) => type.id)]);

  if (inserts.length) {
    await client.insert(orgUnitTypes).values(
      inserts.map((type) => ({
        ...type,
        code: type.code ?? null,
        allowedParentTypeIds: unique(
          (type.allowedParentTypeIds ?? []).map((parent) => ids[parent] ?? parent),
        ).filter((parent) => here.has(parent)),
      })),
    );
  }

  await publishTypeEvents(client, 'type_created', inserts);

  return { ids };
};
