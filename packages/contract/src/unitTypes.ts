import { orgUnitTypes } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Id, isoDate, listOf } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';

export const PLUGIN_UNIT_TYPES_MAX = 20;

const TYPE_COLOR = /^#[0-9a-fA-F]{6}$/;
const TYPE_ICON = /^Icon[A-Za-z0-9]+$/;

/** A kind of unit the organisation uses, and where units of it may sit. */
export const UnitType = createSelectSchema(orgUnitTypes, {
  id: Id,
  allowedParentTypeIds: z.array(Id),
  sortOrder: () => z.int(),
  createdAt: isoDate,
  updatedAt: isoDate,
})
  .pick({
    id: true,
    name: true,
    code: true,
    description: true,
    color: true,
    icon: true,
    /** Units of it may sit right under the organisation. */
    canBeRoot: true,
    /** The types its units may sit under; empty for any. */
    allowedParentTypeIds: true,
    /** Inactive types stay on their units but aren't given to others. */
    isActive: true,
    /** The first active type that fits is the one a unit gets when none is named. */
    sortOrder: true,

    plugin: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    pluginTitle: z.string().nullable(),

    hidden: z.boolean(),
  });

export type UnitType = z.infer<typeof UnitType>;

const UnitTypeFields = createUpdateSchema(orgUnitTypes, {
  name: (name) => name.trim().min(1).max(100),
  code: (code) => code.trim().min(1).max(50),
  description: (text) => text.trim().max(2000),
  color: (color) => color.regex(TYPE_COLOR, '#rrggbb'),
  icon: (icon) => icon.regex(TYPE_ICON, 'a Tabler icon name').max(60),
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
const ImportedUnitType = UnitTypeFields.required({ name: true }).extend({ id: Id });

export const PluginUnitType = z.object({
  code: z
    .string()
    .regex(/^[a-z][a-z0-9_]{0,49}$/, 'lower case letters, digits and _ (starting with a letter)'),
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(2000).optional(),
  color: z.string().regex(TYPE_COLOR, '#rrggbb').optional(),
  icon: z.string().regex(TYPE_ICON, 'a Tabler icon name').max(60).optional(),

  canBeRoot: z.boolean().optional(),
  parents: z.array(z.string().min(1).max(50)).max(PLUGIN_UNIT_TYPES_MAX).optional(),
});

export const PluginUnitTypes = z
  .array(PluginUnitType)
  .max(PLUGIN_UNIT_TYPES_MAX)
  .refine((list) => new Set(list.map((type) => type.code)).size === list.length, 'each code once')
  .refine(
    (list) =>
      list.every((type) => (type.parents ?? []).every((code) => list.some((t) => t.code === code))),
    "parents name the manifest's own unit type codes",
  );

const { INVALID_REFERENCE, LAST_UNIT_TYPE, PLUGIN_UNIT_TYPE, TAKEN, UNIT_TYPE_IN_USE } = ERRORS;

const base = oc.errors({
  ...COMMON_ERRORS,
  INVALID_REFERENCE,
  TAKEN,
  LAST_UNIT_TYPE,
  UNIT_TYPE_IN_USE,
  PLUGIN_UNIT_TYPE,
});

/**
 * The unit types an organisation uses. Every organisation starts with Branch and Department and
 * keeps an active type of its own. A plugin's types (`plugin`) come from its manifest's
 * `unitTypes` and answer 403 PLUGIN_UNIT_TYPE to a change. Changes send
 * `core.unit.type_created`, `core.unit.type_updated` and `core.unit.type_deleted` (`entityType`
 * `unit_type`), so a `core.unit.*` subscription gets them too; a manifest's types arrive without
 * events, so read them with `unitTypes.list`.
 */
export const unitTypesContract = {
  list: base
    .route({
      method: 'GET',
      path: '/unit-types',
      summary: "Unit types, in order: the organisation's own and its plugins'",
    })
    .input(z.object({}))
    .output(listOf(UnitType)),
  create: base
    .route({
      method: 'POST',
      path: '/unit-types',
      successStatus: 201,
      summary:
        "409 TAKEN when the code is taken. 400 INVALID_REFERENCE when an allowed parent type isn't one of the organisation's",
    })
    .input(UnitTypeFields.required({ name: true }))
    .output(UnitType),
  update: base
    .route({
      method: 'PATCH',
      path: '/unit-types/{id}',
      summary:
        "Its rules apply to units added or moved from now on. 409 LAST_UNIT_TYPE when the organisation would have no active type of its own, 403 PLUGIN_UNIT_TYPE for a plugin's type",
    })
    .input(
      UnitTypeFields.extend({ id: Id }).refine(
        (value) => Object.keys(value).some((key) => key !== 'id'),
        'nothing to update',
      ),
    )
    .output(UnitType),
  remove: base
    .route({
      method: 'DELETE',
      path: '/unit-types/{id}',
      summary:
        "409 UNIT_TYPE_IN_USE while units have it, 409 LAST_UNIT_TYPE for the organisation's last active type of its own, 403 PLUGIN_UNIT_TYPE for a plugin's type",
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  import: base
    .route({
      method: 'POST',
      path: '/unit-types/import',
      summary:
        "Bring a plugin's unit types in as the organisation's own, keeping their ids. One whose id is taken, or with the same code (or name when it has no code), merges into that one: `ids` maps each given id to the type it is now",
    })
    .input(z.object({ types: z.array(ImportedUnitType).min(1).max(200) }))
    .output(z.object({ ids: z.record(Id, Id) })),
};
