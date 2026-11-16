import type { UnitKind } from '@erxes/core-contract';
import { type Db, newId, orgUnitTypes, orgUnits } from '@erxes/core-db';
import { and, asc, eq, inArray, ne, sql } from 'drizzle-orm';
import { fail, notFound } from '~/http/errors';
import { unique } from '~/lib/contacts';
import { wholeList } from '~/lib/keyset';
import { oneRow } from '~/lib/rows';
import { publishCoreEvents } from '~/modules/events/events.service';

export type UnitTypeRow = typeof orgUnitTypes.$inferSelect;

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

/** What every organisation starts with: one type per kind, named as old erxes named them. */
const DEFAULT_TYPES = [
  { kind: 'branch', name: 'Branch', code: 'branch', color: '#0ea5e9', icon: 'IconBuildingStore' },
  {
    kind: 'department',
    name: 'Department',
    code: 'department',
    color: '#6366f1',
    icon: 'IconSitemap',
  },
] as const;

export const seedUnitTypes = async (tx: Db, orgId: string) => {
  await tx
    .insert(orgUnitTypes)
    .values(DEFAULT_TYPES.map((type) => ({ ...type, id: newId(), orgId })));
};

const ordered = [asc(orgUnitTypes.kind), asc(orgUnitTypes.sortOrder), asc(orgUnitTypes.createdAt)];

export const unitTypeRows = (client: Db, query: { kind?: UnitKind } = {}) =>
  wholeList((limit) =>
    client
      .select()
      .from(orgUnitTypes)
      .where(query.kind ? eq(orgUnitTypes.kind, query.kind) : undefined)
      .orderBy(...ordered)
      .limit(limit),
  );

export const findType = async (client: Db, id: string) => {
  const [row] = await client.select().from(orgUnitTypes).where(eq(orgUnitTypes.id, id));

  if (!row) throw notFound('Unit type');

  return row;
};

const badType = (message: string) => fail('INVALID_REFERENCE', message, { field: 'typeId' });

/**
 * The type a unit of `kind` gets: the named one, which must be an active type of that kind, or
 * the kind's first active type.
 */
export const typeForUnit = async (client: Db, kind: UnitKind, typeId?: string) => {
  const [row] = await client
    .select()
    .from(orgUnitTypes)
    .where(
      and(
        eq(orgUnitTypes.kind, kind),
        eq(orgUnitTypes.isActive, true),
        typeId ? eq(orgUnitTypes.id, typeId) : undefined,
      ),
    )
    .orderBy(...ordered)
    .limit(1);

  if (!row) throw badType(typeId ? `Not an active ${kind} type` : `No active ${kind} type`);

  return row;
};

/** A unit of `type` may sit under a unit of `parentTypeId` (null: at the top). */
export const assertPlacement = (type: UnitTypeRow, parentTypeId: string | null) => {
  if (parentTypeId === null) {
    if (!type.canBeRoot) throw badType(`A ${type.name} can't be at the top`);

    return;
  }

  if (type.allowedParentTypeIds.length && !type.allowedParentTypeIds.includes(parentTypeId)) {
    throw badType(`A ${type.name} can't sit under this unit`);
  }
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

const assertParentTypes = async (client: Db, kind: UnitKind, ids: string[] | undefined) => {
  const wanted = unique(ids ?? []);

  if (!wanted.length) return wanted;

  const found = await client.$count(
    orgUnitTypes,
    and(eq(orgUnitTypes.kind, kind), inArray(orgUnitTypes.id, wanted)),
  );

  if (found !== wanted.length) {
    throw fail('INVALID_REFERENCE', `Not a ${kind} type`, { field: 'allowedParentTypeIds' });
  }

  return wanted;
};

/** 409 unless another active type of the kind stays. */
const assertAnotherActive = async (client: Db, type: UnitTypeRow) => {
  const others = await client.$count(
    orgUnitTypes,
    and(
      eq(orgUnitTypes.kind, type.kind),
      eq(orgUnitTypes.isActive, true),
      ne(orgUnitTypes.id, type.id),
    ),
  );

  if (!others) {
    throw fail('LAST_UNIT_TYPE', `Keep at least one active ${type.kind} type`);
  }
};

type TypeAction = 'type_created' | 'type_updated' | 'type_deleted';

const publishTypeEvents = (
  client: Db,
  action: TypeAction,
  changes: { id: string; kind: UnitKind; changed?: string[] }[],
) =>
  publishCoreEvents(
    client,
    changes.map(({ id, kind, changed }) => ({
      type: `core.unit.${action}`,
      entityType: 'unit_type',
      entityId: id,
      payload: { kind, changed: changed ?? [] },
    })),
  );

export const createUnitType = async (
  client: Db,
  { allowedParentTypeIds, ...fields }: UnitTypeFields & { kind: UnitKind; name: string },
) => {
  const parents = await assertParentTypes(client, fields.kind, allowedParentTypeIds);

  const row = oneRow(
    await client
      .insert(orgUnitTypes)
      .values({ ...fields, id: newId(), allowedParentTypeIds: parents })
      .returning(),
  );

  await publishTypeEvents(client, 'type_created', [row]);

  return row;
};

export const updateUnitType = async (client: Db, id: string, fields: UnitTypeFields) => {
  const type = await findType(client, id);

  if (fields.isActive === false && type.isActive) await assertAnotherActive(client, type);

  const parents =
    fields.allowedParentTypeIds &&
    (await assertParentTypes(client, type.kind, fields.allowedParentTypeIds));

  const row = oneRow(
    await client
      .update(orgUnitTypes)
      .set({
        ...fields,
        ...(parents ? { allowedParentTypeIds: parents } : {}),
        updatedAt: sql`now()`,
      })
      .where(eq(orgUnitTypes.id, id))
      .returning(),
  );

  await publishTypeEvents(client, 'type_updated', [
    { id, kind: type.kind, changed: Object.keys(fields) },
  ]);

  return row;
};

/** Deletes an unused type and drops it from the others' allowed parents. */
export const removeUnitType = async (client: Db, id: string) => {
  const type = await findType(client, id);
  const count = await client.$count(orgUnits, eq(orgUnits.typeId, id));

  if (count) {
    throw fail(
      'UNIT_TYPE_IN_USE',
      `${count} units are ${type.name}s: give them another type first`,
      {
        count,
      },
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
    pruned.map((row) => ({ id: row.id, kind: type.kind, changed: ['allowedParentTypeIds'] })),
  );

  return type;
};

export type ImportedUnitType = UnitTypeFields & { id: string; kind: UnitKind; name: string };

const lower = (value: string | null | undefined) => value?.trim().toLowerCase() ?? null;

/** The type an imported one is: same id, or same kind and code, or same kind and name. */
const sameType = (known: UnitTypeRow[], type: ImportedUnitType) =>
  known.find((other) => other.id === type.id) ??
  known.find(
    (other) =>
      other.kind === type.kind &&
      (type.code ? lower(other.code) === lower(type.code) : lower(other.name) === lower(type.name)),
  );

/**
 * Brings a plugin's unit types in, keeping their ids. One already here merges into that one;
 * allowed parents are mapped to what their types became and kept when they are of the kind.
 */
export const importUnitTypes = async (client: Db, types: ImportedUnitType[]) => {
  const known = await unitTypeRows(client);
  const ids: Record<string, string> = {};
  const inserts: ImportedUnitType[] = [];

  for (const type of types) {
    const match = sameType(known, type);

    if (match && match.kind !== type.kind) {
      throw fail(
        'INVALID_REFERENCE',
        `${type.id} is a ${match.kind} type, not a ${type.kind} type`,
        {
          field: 'types',
        },
      );
    }

    ids[type.id] = match?.id ?? type.id;

    if (!match) inserts.push(type);
  }

  const kindOf = new Map([
    ...known.map((type) => [type.id, type.kind] as const),
    ...inserts.map((type) => [type.id, type.kind] as const),
  ]);

  if (inserts.length) {
    await client.insert(orgUnitTypes).values(
      inserts.map((type) => ({
        ...type,
        code: type.code ?? null,
        allowedParentTypeIds: unique(
          (type.allowedParentTypeIds ?? []).map((parent) => ids[parent] ?? parent),
        ).filter((parent) => kindOf.get(parent) === type.kind),
      })),
    );
  }

  await publishTypeEvents(client, 'type_created', inserts);

  return { ids };
};
