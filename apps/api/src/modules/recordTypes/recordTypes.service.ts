import {
  CORE_RECORD_TYPES,
  CUSTOM_OBJECT_NATIVE_FIELDS,
  customObjectType,
  type ExtendableRecordType,
} from '@erxes/core-contract';
import {
  caller,
  type Db,
  dataObjects,
  dataPlugins,
  plugins,
  type StoredPluginManifest,
} from '@erxes/core-db';
import { asc, eq } from 'drizzle-orm';
import { can } from '~/http/access';
import { fail } from '~/http/errors';
import { installedPlugins } from '~/modules/plugins/installedPlugin';

/** What reads and changes a custom object's records. */
const OBJECT_PERMISSIONS = { permission: 'objects.view', updatePermission: 'objects.edit' };

/** One of a plugin's manifest `objects`, as core keeps it. */
export type PluginObject = NonNullable<StoredPluginManifest['objects']>[number];

/** A plugin installed here that declares `objects`, and whether Data Extensions is connected to it. */
export interface ObjectsPlugin {
  plugin: string;
  title: string;
  objects: PluginObject[];
  connected: boolean;
}

/** The installed plugins that declare objects, by name. */
export const objectsPlugins = async (client: Db): Promise<ObjectsPlugin[]> => {
  const [rows, links] = await Promise.all([
    installedPlugins(client).orderBy(asc(plugins.name)),
    client.select({ plugin: dataPlugins.plugin }).from(dataPlugins),
  ]);

  const connected = new Set(links.map((link) => link.plugin));

  return rows.flatMap(({ name, manifest }) =>
    manifest?.objects?.length
      ? [
          {
            plugin: name,
            title: manifest.title,
            objects: manifest.objects,
            connected: connected.has(name),
          },
        ]
      : [],
  );
};

/** A plugin object as a record type: its own fields are the view's that it declares. */
export const pluginRecordType = (plugin: string, object: PluginObject): ExtendableRecordType => ({
  type: object.type,
  plugin,
  label: object.label,
  singularLabel: object.singularLabel,
  icon: object.icon ?? null,
  permission: object.permission ?? null,
  updatePermission: object.updatePermission ?? null,
  nativeFields: (object.fields ?? []).map((field) => ({
    key: field.key,
    label: field.label,
    type: field.type,
    options: field.options ?? [],
  })),
});

/**
 * The record types that can be extended: core's, the `objects` of each plugin connected to Data
 * Extensions here in plugin order, then the organisation's active custom objects by label.
 */
export const listRecordTypes = async (client: Db): Promise<ExtendableRecordType[]> => {
  const [owners, objects] = await Promise.all([
    objectsPlugins(client),
    client
      .select()
      .from(dataObjects)
      .where(eq(dataObjects.status, 'active'))
      .orderBy(asc(dataObjects.pluralLabel)),
  ]);

  const pluginTypes = owners
    .filter((owner) => owner.connected)
    .flatMap(({ plugin, objects: declared }) =>
      declared.map((object) => pluginRecordType(plugin, object)),
    );

  const customTypes = objects.map((object) => ({
    type: customObjectType(object.key),
    plugin: null,
    label: object.pluralLabel,
    singularLabel: object.singularLabel,
    icon: object.icon,
    ...OBJECT_PERMISSIONS,
    nativeFields: [...CUSTOM_OBJECT_NATIVE_FIELDS],
  }));

  return [...CORE_RECORD_TYPES, ...pluginTypes, ...customTypes];
};

/**
 * One record type, or 400 INVALID_REFERENCE when it isn't core's, a connected plugin's or an
 * active custom object.
 */
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
export const assertRecordRight = (recordType: ExtendableRecordType, right: 'read' | 'update') => {
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
