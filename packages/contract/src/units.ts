import { orgUnitTypes, orgUnits } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Id, isoDate, LIST_MAX, listOf } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';
import { UnitKind } from './values';

/** Members of one unit, or one member's units of a kind, set at once. */
const MemberIds = z.array(Id).max(5000);

/** A kind of branch or department the organisation uses, and where units of it may sit. */
export const UnitType = createSelectSchema(orgUnitTypes, {
  id: Id,
  allowedParentTypeIds: z.array(Id),
  sortOrder: () => z.int(),
  createdAt: isoDate,
  updatedAt: isoDate,
}).pick({
  id: true,
  kind: true,
  name: true,
  code: true,
  description: true,
  color: true,
  icon: true,
  /** Units of it may sit at the top of their tree. */
  canBeRoot: true,
  /** The types of its kind its units may sit under; empty for any. */
  allowedParentTypeIds: true,
  /** Inactive types stay on their units but aren't given to others. */
  isActive: true,
  /** The first active type of a kind is the one a unit gets when none is named. */
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
});

export type UnitType = z.infer<typeof UnitType>;

const UnitTypeFields = createUpdateSchema(orgUnitTypes, {
  name: (name) => name.trim().min(1).max(100),
  code: (code) => code.trim().min(1).max(50),
  description: (text) => text.trim().max(2000),
  color: (color) => color.regex(/^#[0-9a-fA-F]{6}$/, '#rrggbb'),
  icon: (icon) => icon.regex(/^Icon[A-Za-z0-9]+$/, 'a Tabler icon name').max(60),
  allowedParentTypeIds: () => z.array(Id).max(50),
  sortOrder: () => z.int().min(0).max(10_000),
}).pick({
  name: true,
  code: true,
  description: true,
  color: true,
  icon: true,
  canBeRoot: true,
  allowedParentTypeIds: true,
  isActive: true,
  sortOrder: true,
});

/** A unit type a plugin brings from its own tables or old erxes, with its id. */
const ImportedUnitType = UnitTypeFields.required({ name: true }).extend({ id: Id, kind: UnitKind });

export const Unit = createSelectSchema(orgUnits, {
  id: Id,
  createdAt: isoDate,
  updatedAt: isoDate,
})
  .pick({
    id: true,
    kind: true,
    /** One of the organisation's unit types, of the unit's kind. */
    typeId: true,
    name: true,
    code: true,
    parentId: true,
    /** `/<root id>/…/<own id>/`: the units under this one have paths that start with it. */
    path: true,
    supervisorId: true,
    description: true,
    address: true,
    phone: true,
    email: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({ memberIds: z.array(Id) });

export type Unit = z.infer<typeof Unit>;

const UnitFields = createUpdateSchema(orgUnits, {
  name: (name) => name.trim().min(1).max(200),
  code: (code) => code.trim().min(1).max(50),
  typeId: Id.optional(),
  parentId: Id.nullish(),
  supervisorId: Id.nullish(),
  description: (text) => text.trim().max(2000),
  address: (text) => text.trim().max(500),
  phone: (text) => text.trim().max(50),
  email: (text) => text.trim().max(200),
})
  .pick({
    typeId: true,
    name: true,
    code: true,
    parentId: true,
    supervisorId: true,
    description: true,
    address: true,
    phone: true,
    email: true,
  })
  .extend({ memberIds: MemberIds.optional() });

/** A unit a plugin brings from its own tables or old erxes, with its id. */
const ImportedUnit = UnitFields.required({ name: true }).extend({
  id: Id,
  kind: UnitKind,
  memberIds: MemberIds.default([]),
});

const { INVALID_REFERENCE, LAST_UNIT_TYPE, TAKEN, UNIT_LIMIT, UNIT_TYPE_IN_USE } = ERRORS;

const base = oc.errors({ ...COMMON_ERRORS, INVALID_REFERENCE, TAKEN, UNIT_LIMIT });

const typeBase = oc.errors({
  ...COMMON_ERRORS,
  INVALID_REFERENCE,
  TAKEN,
  LAST_UNIT_TYPE,
  UNIT_TYPE_IN_USE,
});

/**
 * The types of branch and department an organisation uses. Every organisation starts with a
 * Branch and a Department type and keeps an active one of each kind. Changes send
 * `core.unit.type_created`, `core.unit.type_updated` and `core.unit.type_deleted` (`entityType`
 * `unit_type`), so a `core.unit.*` subscription gets them too.
 */
export const unitTypesContract = {
  list: typeBase
    .route({ method: 'GET', path: '/unit-types', summary: 'Unit types, by kind and order' })
    .input(z.object({ kind: UnitKind.optional() }))
    .output(listOf(UnitType)),
  create: typeBase
    .route({
      method: 'POST',
      path: '/unit-types',
      successStatus: 201,
      summary:
        '409 TAKEN when the code is taken for its kind. 400 INVALID_REFERENCE when an allowed parent type is of another kind',
    })
    .input(UnitTypeFields.required({ name: true }).extend({ kind: UnitKind }))
    .output(UnitType),
  update: typeBase
    .route({
      method: 'PATCH',
      path: '/unit-types/{id}',
      summary:
        'Its rules apply to units added or moved from now on. 409 LAST_UNIT_TYPE when its kind would have no active type',
    })
    .input(
      UnitTypeFields.extend({ id: Id }).refine(
        (value) => Object.keys(value).some((key) => key !== 'id'),
        'nothing to update',
      ),
    )
    .output(UnitType),
  remove: typeBase
    .route({
      method: 'DELETE',
      path: '/unit-types/{id}',
      summary:
        "409 UNIT_TYPE_IN_USE while units have it, 409 LAST_UNIT_TYPE for its kind's last active type",
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  import: typeBase
    .route({
      method: 'POST',
      path: '/unit-types/import',
      summary:
        "Bring a plugin's unit types in, keeping their ids. One whose id is taken, or of the same kind with the same code (or name when it has no code), merges into that one: `ids` maps each given id to the type it is now",
    })
    .input(z.object({ types: z.array(ImportedUnitType).min(1).max(200) }))
    .output(z.object({ ids: z.record(Id, Id) })),
};

/**
 * Branches (where members work) and departments (what they do): two trees, shared by every
 * plugin. Plugins read with `units:read` and keep a copy, refreshed from `core.unit.created`,
 * `core.unit.updated` and `core.unit.deleted` (the event's `entityId` is the unit).
 */
export const unitsContract = {
  list: base
    .route({
      method: 'GET',
      path: '/units',
      summary: 'Branches or departments with their members, by path (parents first)',
    })
    .input(z.object({ kind: UnitKind.optional(), userId: Id.optional() }))
    .output(listOf(Unit)),
  get: base
    .route({ method: 'GET', path: '/units/{id}' })
    .input(z.object({ id: Id }))
    .output(Unit),
  create: base
    .route({
      method: 'POST',
      path: '/units',
      successStatus: 201,
      summary: `Add a branch or department. 409 TAKEN when the code is taken for its kind, 409 UNIT_LIMIT past ${LIST_MAX} units. 400 INVALID_REFERENCE when the parent is of another kind, or the supervisor or a member isn't on the team`,
    })
    .input(UnitFields.required({ name: true }).extend({ kind: UnitKind }))
    .output(Unit),
  update: base
    .route({
      method: 'PATCH',
      path: '/units/{id}',
      summary:
        'Change a unit; `memberIds` replaces who is in it. 400 INVALID_REFERENCE when the parent is the unit, one under it or of another kind',
    })
    .input(
      UnitFields.extend({ id: Id }).refine(
        (value) => Object.keys(value).some((key) => key !== 'id'),
        'nothing to update',
      ),
    )
    .output(Unit),
  remove: base
    .route({
      method: 'DELETE',
      path: '/units/{id}',
      summary: 'Delete a unit; the units under it move up to its parent',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  assign: base
    .route({
      method: 'PUT',
      path: '/units/members/{userId}',
      summary: "Set a member's branches or departments (the units of `kind` they are in)",
    })
    .input(z.object({ userId: Id, kind: UnitKind, unitIds: z.array(Id).max(100) }))
    .output(z.object({ unitIds: z.array(Id) })),
  import: base
    .route({
      method: 'POST',
      path: '/units/import',
      summary:
        "Bring a plugin's or old erxes' units in, keeping their ids. A unit whose id is taken, or of the same kind with the same code (or name and parent when it has no code), merges into that one: `ids` maps each given id to the unit it is now. Members not on the team are skipped",
    })
    .input(z.object({ units: z.array(ImportedUnit).min(1).max(LIST_MAX) }))
    .output(z.object({ ids: z.record(Id, Id), skippedMembers: z.int() })),
};
