import { CORE_RECORD_TYPES, type RecordRight, type RecordType } from '@erxes/core-contract';
import { type Caller, type Db, plugins } from '@erxes/core-db';
import { asc } from 'drizzle-orm';
import { can } from '~/http/access';
import { installedPlugins } from '~/modules/plugins/installedPlugin';

/**
 * The record types that can be extended: core's, then the `objects` of each plugin installed
 * here, in plugin order.
 */
export const listRecordTypes = async (client: Db): Promise<RecordType[]> => {
  const rows = await installedPlugins(client).orderBy(asc(plugins.name));

  const pluginTypes = rows.flatMap(({ name, manifest }) =>
    (manifest?.objects ?? []).map((object) => ({
      type: object.type,
      plugin: name,
      label: object.label,
      singularLabel: object.singularLabel,
      icon: object.icon ?? null,
      permission: object.permission ?? null,
      updatePermission: object.updatePermission ?? null,
    })),
  );

  return [...CORE_RECORD_TYPES, ...pluginTypes];
};

const allowed = (member: Extract<Caller, { type: 'user' }>, action: string | null) =>
  action === null || can(member, action);

/**
 * What `member` may do with each record type's records: `update` when it may read and change
 * them, `read` when it may only read them. Types it can't read are left out.
 */
export const recordRights = (
  member: Extract<Caller, { type: 'user' }>,
  types: RecordType[],
): Record<string, RecordRight> =>
  Object.fromEntries(
    types.flatMap((recordType): [string, RecordRight][] => {
      if (!allowed(member, recordType.permission)) return [];

      return [[recordType.type, allowed(member, recordType.updatePermission) ? 'update' : 'read']];
    }),
  );
