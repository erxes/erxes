import { caller, type Db, type DataFieldSettings, dataFields, roles } from '@erxes/core-db';
import { inArray, sql } from 'drizzle-orm';
import { fail } from '~/http/errors';
import type { DataFieldRow } from './definitions';

/**
 * Who sees and changes a field's values: `visibleTo` and `editableBy` name roles, and an empty
 * list is everyone. The owner, plugins and core itself see every field. A formula or rollup
 * that reads a field the caller can't see is hidden too, so it can't give that value away.
 */

type Restricted = Pick<DataFieldRow, 'settings'>;

/** The caller's role when field rules apply to them; null when they see every field. */
const ruledRole = () => {
  const who = caller();

  if (who.type !== 'user' || (who.role === 'owner' && !who.key)) return null;

  return who.role;
};

/** Whether field rules apply to the caller at all (a member other than the owner). */
export const fieldsRuled = () => ruledRole() !== null;

const allows = (list: string[] | undefined, role: string | null) =>
  role === null || !list?.length || list.includes(role);

export const canViewField = (field: Restricted) => allows(field.settings.visibleTo, ruledRole());

const canEditField = (field: Restricted) =>
  canViewField(field) && allows(field.settings.editableBy, ruledRole());

/** Throws 403 NOT_ALLOWED unless the caller may change the field's values. */
export const assertEditable = (field: Restricted & { label: string }) => {
  if (!canEditField(field)) throw fail('NOT_ALLOWED', `Your role can't change ${field.label}`);
};

/** The ids of fields, of any record type, the caller can't see. */
const hiddenIds = async (client: Db) => {
  const role = ruledRole();

  if (role === null) return new Set<string>();

  const rows = await client
    .select({ id: dataFields.id, settings: dataFields.settings })
    .from(dataFields)
    .where(sql`jsonb_array_length(coalesce(${dataFields.settings} -> 'visibleTo', '[]')) > 0`);

  return new Set(rows.filter((row) => !allows(row.settings.visibleTo, role)).map((row) => row.id));
};

/**
 * The fields whose values the caller may read: those they can see, less the formulas and
 * rollups that read one they can't (`uses`: what each reads, by its id).
 */
export const readableFields = async (
  client: Db,
  fields: DataFieldRow[],
  uses: ReadonlyMap<string, ReadonlySet<string>>,
) => {
  const hidden = await hiddenIds(client);

  if (!hidden.size) return fields;

  return fields.filter(
    (field) =>
      !hidden.has(field.id) && ![...(uses.get(field.id) ?? [])].some((id) => hidden.has(id)),
  );
};

/** Throws 400 INVALID_REFERENCE when `visibleTo` or `editableBy` names a role the organisation lacks. */
export const assertRoles = async (client: Db, settings: DataFieldSettings) => {
  const named = [...new Set([...(settings.visibleTo ?? []), ...(settings.editableBy ?? [])])];

  if (!named.length) return;

  const found = await client
    .select({ key: roles.key })
    .from(roles)
    .where(inArray(roles.key, named));

  const known = new Set(found.map((row) => row.key));
  const missing = named.filter((key) => !known.has(key));

  if (missing.length) {
    throw fail('INVALID_REFERENCE', `${missing.join(', ')} is not a role here`, {
      field: 'settings.visibleTo',
    });
  }
};
