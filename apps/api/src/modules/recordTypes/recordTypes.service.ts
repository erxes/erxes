import { CORE_RECORD_TYPES, customObjectType, type RecordType } from '@erxes/core-contract';
import { caller, type Db, dataObjects, plugins } from '@erxes/core-db';
import { asc, eq } from 'drizzle-orm';
import { can } from '~/http/access';
import { fail } from '~/http/errors';
import { installedPlugins } from '~/modules/plugins/installedPlugin';

/** What reads and changes a custom object's records. */
const OBJECT_PERMISSIONS = { permission: 'objects.view', updatePermission: 'objects.edit' };

/**
 * The record types that can be extended: core's, the `objects` of each plugin installed here in
 * plugin order, then the organisation's active custom objects by label.
 */
export const listRecordTypes = async (client: Db): Promise<RecordType[]> => {
  const [rows, objects] = await Promise.all([
    installedPlugins(client).orderBy(asc(plugins.name)),
    client
      .select()
      .from(dataObjects)
      .where(eq(dataObjects.status, 'active'))
      .orderBy(asc(dataObjects.pluralLabel)),
  ]);

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

  const customTypes = objects.map((object) => ({
    type: customObjectType(object.key),
    plugin: null,
    label: object.pluralLabel,
    singularLabel: object.singularLabel,
    icon: object.icon,
    ...OBJECT_PERMISSIONS,
  }));

  return [...CORE_RECORD_TYPES, ...pluginTypes, ...customTypes];
};

/** One record type, or 400 INVALID_REFERENCE when it isn't core's, an installed plugin's or an active custom object. */
export const findRecordType = async (client: Db, type: string) => {
  const found = (await listRecordTypes(client)).find((recordType) => recordType.type === type);

  if (!found) {
    throw fail('INVALID_REFERENCE', `${type} is not a record type here`, { field: 'recordType' });
  }

  return found;
};

/**
 * Throws 403 NOT_ALLOWED unless the caller may read (`read`) or change (`update`) the type's
 * records: a member whose role holds the type's permission, or the plugin that keeps them.
 * Their Data Extensions values follow the same rights.
 */
export const assertRecordRight = (recordType: RecordType, right: 'read' | 'update') => {
  const action = right === 'read' ? recordType.permission : recordType.updatePermission;
  const who = caller();

  if (who.type === 'plugin') {
    if (who.plugin === recordType.plugin) return;

    throw fail('NOT_ALLOWED', `Only ${recordType.plugin ?? 'core'} reads ${recordType.type} here`);
  }

  if (who.type === 'user' && (action === null || can(who, action))) return;

  throw fail('NOT_ALLOWED', `You need the ${action ?? 'member'} permission`, {
    permission: action ?? 'member',
  });
};
