import { callerUserId, type Db, dataFields, dataPlugins } from '@erxes/core-db';
import { and, count, eq, inArray } from 'drizzle-orm';
import { fail } from '~/http/errors';
import {
  type ObjectsPlugin,
  objectsPlugins,
  pluginRecordType,
} from '~/modules/recordTypes/recordTypes.service';
import { pluginObjectViews, viewProblem } from './nativeSources';

/**
 * Plugins connected to Data Extensions. An installed plugin's manifest `objects` are its
 * record types members may extend; connecting one makes them extendable here, and its views
 * give formulas and rollups its records' own fields.
 */

const typesOf = (owner: ObjectsPlugin) => owner.objects.map((object) => object.type);

/** Active fields members added to these plugins' record types, by record type. */
const fieldCounts = async (client: Db, owners: ObjectsPlugin[]) => {
  const rows = await client
    .select({ recordType: dataFields.recordType, total: count() })
    .from(dataFields)
    .where(
      and(inArray(dataFields.recordType, owners.flatMap(typesOf)), eq(dataFields.status, 'active')),
    )
    .groupBy(dataFields.recordType);

  const counts = new Map(rows.map((row) => [row.recordType, row.total]));

  return (owner: ObjectsPlugin) =>
    typesOf(owner).reduce((sum, type) => sum + (counts.get(type) ?? 0), 0);
};

const describe = async (client: Db, owners: ObjectsPlugin[]) => {
  const [views, links, fieldCount] = await Promise.all([
    pluginObjectViews(client, owners),
    client.select().from(dataPlugins),
    fieldCounts(client, owners),
  ]);

  const columns = new Map(views.map((view) => [view.object.type, view.columns]));
  const linked = new Map(links.map((link) => [link.plugin, link]));

  return owners.map((owner) => {
    const link = linked.get(owner.plugin);

    return {
      plugin: owner.plugin,
      title: owner.title,
      objects: owner.objects.map((object) => {
        const type = pluginRecordType(owner.plugin, object);

        return {
          type: type.type,
          label: type.label,
          singularLabel: type.singularLabel,
          icon: type.icon,
          nativeFields: type.nativeFields,
          problem: viewProblem(object, columns.get(object.type)),
        };
      }),
      connected: Boolean(link),
      connectedAt: link?.connectedAt ?? null,
      connectedBy: link?.connectedBy ?? null,
      fieldCount: fieldCount(owner),
    };
  });
};

export const listDataPlugins = async (client: Db) => ({
  data: await describe(client, await objectsPlugins(client)),
});

/** A plugin installed here with objects, or 400 PLUGIN_NOT_INSTALLED. */
const ownerOf = async (client: Db, plugin: string) => {
  const owner = (await objectsPlugins(client)).find((row) => row.plugin === plugin);

  if (!owner) {
    throw fail(
      'PLUGIN_NOT_INSTALLED',
      `${plugin} isn't installed here, or has no objects to extend`,
    );
  }

  return owner;
};

const described = async (client: Db, owner: ObjectsPlugin) => {
  const [entry] = await describe(client, [owner]);

  if (!entry) throw new Error('Expected the plugin described');

  return entry;
};

export const connectPlugin = async (client: Db, plugin: string) => {
  const owner = await ownerOf(client, plugin);

  await client
    .insert(dataPlugins)
    .values({ plugin, connectedBy: callerUserId() })
    .onConflictDoNothing();

  return described(client, { ...owner, connected: true });
};

/** Disconnects a plugin once its record types have no active fields (409 ARCHIVE_FIRST). */
export const disconnectPlugin = async (client: Db, plugin: string) => {
  const owner = await ownerOf(client, plugin);
  const fields = (await fieldCounts(client, [owner]))(owner);

  if (fields) {
    throw fail(
      'ARCHIVE_FIRST',
      `Archive the ${fields} fields added to ${owner.title}’s records before disconnecting it`,
    );
  }

  await client.delete(dataPlugins).where(eq(dataPlugins.plugin, plugin));

  return described(client, { ...owner, connected: false });
};
