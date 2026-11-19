import { orgUnits } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { cursorPageOf, CursorQuery, Id, isoDate, LIST_MAX, QueryBoolean } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';

export const UNIT_MAX = 50_000;

export const UNIT_DEPTH_MAX = 32;

export const UNIT_CHILDREN_MAX = 200;

export const UNIT_SEARCH_MAX = 50;

/** Members of one unit, or one member's units, set at once. */
const MemberIds = z.array(Id).max(5000);

const UnitRow = createSelectSchema(orgUnits, {
  id: Id,
  sortOrder: () => z.int(),
  createdAt: isoDate,
  updatedAt: isoDate,
}).pick({
  id: true,
  /** One of the organisation's unit types; null only for the organisation's own unit. */
  typeId: true,
  name: true,
  code: true,

  parentId: true,
  /** `/<top id>/…/<own id>/`: the units under this one have paths that start with it. */
  path: true,
  supervisorId: true,
  description: true,
  address: true,
  phone: true,
  email: true,

  isActive: true,

  sortOrder: true,
  createdAt: true,
  updatedAt: true,
});

export const Unit = UnitRow.extend({ memberIds: z.array(Id) });

export type Unit = z.infer<typeof Unit>;

export const UnitNode = UnitRow.extend({
  childCount: z.int(),

  memberCount: z.int(),

  subtreeMemberCount: z.int(),
});

export type UnitNode = z.infer<typeof UnitNode>;

export const UnitDetail = Unit.extend({
  childCount: z.int(),

  descendantCount: z.int(),
  subtreeMemberCount: z.int(),
});

export type UnitDetail = z.infer<typeof UnitDetail>;

export const UnitHit = UnitNode.extend({ ancestorNames: z.array(z.string()) });

export type UnitHit = z.infer<typeof UnitHit>;

const UnitFields = createUpdateSchema(orgUnits, {
  name: (name) => name.trim().min(1).max(200),
  code: (code) => code.trim().min(1).max(50),
  typeId: Id.optional(),
  supervisorId: Id.nullish(),
  description: (text) => text.trim().max(2000),
  address: (text) => text.trim().max(500),
  phone: (text) => text.trim().max(50),
  email: (text) => text.trim().max(200),
  sortOrder: () => z.int().min(0).max(1_000_000),
})
  .pick({
    typeId: true,
    name: true,
    code: true,
    supervisorId: true,
    description: true,
    address: true,
    phone: true,
    email: true,
    isActive: true,
    sortOrder: true,
  })
  .extend({ memberIds: MemberIds.optional() });

const ParentId = Id.nullish();

/** A unit a plugin brings from its own tables or old erxes, with its id. */
const ImportedUnit = UnitFields.required({ name: true }).extend({
  id: Id.regex(/^[^/]+$/, 'a unit id has no "/": paths are made of ids'),
  parentId: ParentId,
  memberIds: MemberIds.default([]),
});

const { INVALID_REFERENCE, ROOT_UNIT, TAKEN, UNIT_LIMIT, UNIT_NOT_EMPTY } = ERRORS;

const base = oc.errors({
  ...COMMON_ERRORS,
  INVALID_REFERENCE,
  TAKEN,
  UNIT_LIMIT,
  ROOT_UNIT,
  UNIT_NOT_EMPTY,
});

const IncludeInactive = QueryBoolean.optional();

/**
 * The organisation's structure: one tree, shared by every plugin. Its top is the organisation's
 * own unit (`units.root`: no parent, no type), which is there from the start and can't be moved,
 * deleted or turned off (409 ROOT_UNIT). Plugins read with `units:read` and keep a copy,
 * refreshed from `core.unit.created`, `core.unit.updated` and `core.unit.deleted` (the event's
 * `entityId` is the unit, `payload.changed` the fields). A move sends one `core.unit.updated`
 * for the moved unit with `payload.subtree` true: the paths of every unit under it changed, so
 * read them again. A unit's id is never given to another unit.
 */
export const unitsContract = {
  list: base
    .route({
      method: 'GET',
      path: '/units',
      summary:
        "Every unit with its members, newest first, by pages: what a plugin's copy reads. Inactive units and units of hidden types are among them",
    })
    .input(CursorQuery.extend({ userId: Id.optional(), typeId: Id.optional() }))
    .output(cursorPageOf(Unit)),
  root: base
    .route({ method: 'GET', path: '/units/root', summary: "The organisation's own unit" })
    .input(z.object({}))
    .output(UnitDetail),
  search: base
    .route({
      method: 'GET',
      path: '/units/search',
      summary: `Units by name or code, names that start with the words first, at most ${UNIT_SEARCH_MAX}. Units of hidden types and the units under them are left out, and inactive ones unless asked for`,
    })
    .input(
      z.object({
        q: z.string().trim().min(1).max(100),
        limit: z.coerce.number().int().min(1).max(UNIT_SEARCH_MAX).default(20),
        includeInactive: IncludeInactive,
      }),
    )
    .output(z.object({ data: z.array(UnitHit).max(UNIT_SEARCH_MAX) })),
  get: base
    .route({ method: 'GET', path: '/units/{id}' })
    .input(z.object({ id: Id }))
    .output(UnitDetail),
  children: base
    .route({
      method: 'GET',
      path: '/units/{id}/children',
      summary: `The units right under one in their order, a new or moved one last, ${UNIT_CHILDREN_MAX} at most at once; \`nextCursor\` asks for the rest. Units of hidden types are left out, and inactive ones unless asked for`,
    })
    .input(
      z.object({
        id: Id,
        cursor: Id.optional(),
        limit: z.coerce.number().int().min(1).max(UNIT_CHILDREN_MAX).default(50),
        includeInactive: IncludeInactive,
      }),
    )
    .output(
      z.object({
        data: z.array(UnitNode).max(UNIT_CHILDREN_MAX),

        nextCursor: Id.nullable(),

        totalCount: z.int(),
      }),
    ),
  ancestors: base
    .route({
      method: 'GET',
      path: '/units/{id}/ancestors',
      summary: "The units above one, from the organisation's own down to its parent",
    })
    .input(z.object({ id: Id, includeInactive: IncludeInactive }))
    .output(z.object({ data: z.array(UnitNode).max(UNIT_DEPTH_MAX) })),
  create: base
    .route({
      method: 'POST',
      path: '/units',
      successStatus: 201,
      summary: `Add a unit under \`parentId\`, or right under the organisation. 409 TAKEN when the code is taken, 409 UNIT_LIMIT past ${UNIT_MAX} units. 400 INVALID_REFERENCE when its type can't sit there, the tree would be deeper than ${UNIT_DEPTH_MAX}, or the supervisor or a member isn't on the team`,
    })
    .input(UnitFields.required({ name: true }).extend({ parentId: ParentId }))
    .output(Unit),
  update: base
    .route({
      method: 'PATCH',
      path: '/units/{id}',
      summary:
        "Change a unit; `memberIds` replaces who is in it, `isActive` false turns it off. Its place changes with `units.move`. 409 ROOT_UNIT when the organisation's own unit would get a type or go inactive",
    })
    .input(
      UnitFields.extend({ id: Id }).refine(
        (value) => Object.keys(value).some((key) => key !== 'id'),
        'nothing to update',
      ),
    )
    .output(Unit),
  move: base
    .route({
      method: 'POST',
      path: '/units/{id}/move',
      summary:
        "Move a unit, with every unit under it, under `parentId` (null: right under the organisation). It changes who can reach what is under it, so the audit entry keeps the old and the new parent. 400 INVALID_REFERENCE when the parent is the unit or one under it, or its type can't sit there",
    })
    .input(z.object({ id: Id, parentId: Id.nullable() }))
    .output(Unit),
  reorder: base
    .route({
      method: 'PUT',
      path: '/units/{id}/order',
      summary:
        "Put units right under this one in the given order; those not named keep their place after them. Sends one `core.unit.updated` for this unit with `changed: ['childOrder']`: read its children again. 400 INVALID_REFERENCE when one is not right under it",
    })
    .input(z.object({ id: Id, unitIds: z.array(Id).min(1).max(UNIT_CHILDREN_MAX) }))
    .output(z.object({ ok: z.literal(true) })),
  remove: base
    .route({
      method: 'DELETE',
      path: '/units/{id}',
      summary:
        'Delete a unit nothing is in. 409 UNIT_NOT_EMPTY while units sit under it, members are in it or API keys name it: turn it off instead (`isActive` false)',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  assign: base
    .route({
      method: 'PUT',
      path: '/units/members/{userId}',
      summary: "Set a member's units: in exactly these, out of every other",
    })
    .input(z.object({ userId: Id, unitIds: z.array(Id).max(100) }))
    .output(z.object({ unitIds: z.array(Id) })),
  import: base
    .route({
      method: 'POST',
      path: '/units/import',
      summary:
        "Bring a plugin's or old erxes' units in, keeping their ids. A unit whose id is taken, or with the same code (or name and parent when it has no code), merges into that one: `ids` maps each given id to the unit it is now. A unit without a parent here goes right under the organisation. Members not on the team are skipped. 409 TAKEN for the id of a deleted unit",
    })
    .input(z.object({ units: z.array(ImportedUnit).min(1).max(LIST_MAX) }))
    .output(z.object({ ids: z.record(Id, Id), skippedMembers: z.int() })),
};
