import { CORE_PERMISSION_AREAS, type PluginManifest } from '@erxes/core-contract';
import { fail } from '~/http/errors';

/** A plugin named after a core area would declare core's permissions as its own. */
export const reservedName = (name: string) => CORE_PERMISSION_AREAS.has(name);

const namespaced = (plugin: string, values: string[] | undefined, what: string) => {
  const wrong = (values ?? []).find((value) => !value.startsWith(`${plugin}.`));

  if (wrong) {
    throw fail('NAMESPACE_REQUIRED', `${what} must start with "${plugin}.": ${wrong}`);
  }
};

/** Permission sets name only the manifest's own permissions, and each key once. */
const ownPermissionSets = (manifest: PluginManifest) => {
  const declared = new Set(manifest.permissions?.map((item) => item.action));
  const keys = new Set<string>();

  for (const set of manifest.permissionSets ?? []) {
    const unknown = set.permissions.find((action) => !declared.has(action));

    if (unknown) {
      throw fail(
        'UNKNOWN_PERMISSION',
        `Permission set "${set.key}" names ${unknown}, which the manifest's permissions don't declare`,
        { permissions: [unknown] },
      );
    }

    if (keys.has(set.key)) {
      throw fail('DUPLICATE_PERMISSION_SET', `Two permission sets are "${set.key}"`);
    }

    keys.add(set.key);
  }
};

/** Relations read the plugin's own views, and need one of its own permissions. */
const ownRelations = (plugin: string, manifest: PluginManifest) => {
  const permissions = new Set(manifest.permissions?.map((item) => item.action));

  for (const relation of manifest.relations ?? []) {
    if (!relation.view.startsWith(`${plugin}_`)) {
      throw fail(
        'NAMESPACE_REQUIRED',
        `Relation "${relation.key}" must read a view of the plugin, named ${plugin}_*: ${relation.view}`,
      );
    }

    if (relation.permission && !permissions.has(relation.permission)) {
      throw fail(
        'UNKNOWN_PERMISSION',
        `Relation "${relation.key}" needs ${relation.permission}, which the manifest's permissions don't declare`,
        { permissions: [relation.permission] },
      );
    }
  }
};

/** Objects are the plugin's own record types, read and changed with its own permissions. */
const ownObjects = (plugin: string, manifest: PluginManifest) => {
  const objects = manifest.objects ?? [];
  const declared = new Set(manifest.permissions?.map((item) => item.action));

  namespaced(
    plugin,
    objects.map((object) => object.type),
    'Object types',
  );

  const unknown = objects
    .flatMap((object) => [object.permission, object.updatePermission])
    .find((action) => action !== undefined && !declared.has(action));

  if (unknown) {
    throw fail(
      'UNKNOWN_PERMISSION',
      `An object needs ${unknown}, which the manifest's permissions don't declare`,
      { permissions: [unknown] },
    );
  }
};

/** Reads name another plugin, with that plugin's permissions only. */
const othersReads = (plugin: string, manifest: PluginManifest) => {
  for (const read of manifest.pluginReads ?? []) {
    if (read.plugin === plugin) {
      throw fail('NAMESPACE_REQUIRED', `pluginReads names ${plugin} itself`);
    }

    namespaced(read.plugin, read.permissions, `Reads of ${read.plugin}`);
  }
};

/**
 * What a manifest may claim: only names under the plugin's own namespace, and only its own
 * permissions. Throws the first problem it finds.
 */
export const checkManifest = (plugin: string, manifest: PluginManifest) => {
  // A row registered before the name was reserved still can't claim core's permissions.
  if (reservedName(plugin)) {
    throw fail('NAMESPACE_REQUIRED', `"${plugin}" is a core area: rename the plugin`);
  }

  namespaced(
    plugin,
    manifest.permissions?.map((item) => item.action),
    'Permission actions',
  );
  ownPermissionSets(manifest);
  namespaced(
    plugin,
    manifest.notificationKinds?.map((item) => item.kind),
    'Notification kinds',
  );
  namespaced(
    plugin,
    manifest.events?.map((item) => item.type),
    'Event types',
  );

  if (manifest.assistant?.operations.length && !manifest.api) {
    throw fail('API_REQUIRED', 'Assistant operations are called at api.url: add api');
  }

  ownRelations(plugin, manifest);
  ownObjects(plugin, manifest);
  othersReads(plugin, manifest);
};
