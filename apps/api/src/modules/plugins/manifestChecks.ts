import { type PluginManifest } from '@erxes/core-contract';
import { fail } from '~/http/errors';
import { INTEGRATIONS } from '~/modules/integrations/registry';

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

/** Its transfer record types are its own (`<plugin>:<record>`) and name permissions the manifest declares. */
const ownTransfers = (plugin: string, manifest: PluginManifest) => {
  const declared = new Set(manifest.permissions?.map((item) => item.action));

  for (const spec of manifest.transfer ?? []) {
    if (!spec.type.startsWith(`${plugin}:`)) {
      throw fail('NAMESPACE_REQUIRED', `Transfer types must start with "${plugin}:": ${spec.type}`);
    }

    const unknown = [spec.exportPermission, spec.importPermission].find(
      (action) => !declared.has(action),
    );

    if (unknown) {
      throw fail(
        'UNKNOWN_PERMISSION',
        `Transfer type "${spec.type}" names ${unknown}, which the manifest's permissions don't declare`,
        { permissions: [unknown] },
      );
    }
  }
};

/** Its integrations need one of its own permissions; its actions name only its own integrations. */
const ownIntegrations = (manifest: PluginManifest) => {
  const declared = new Set(manifest.permissions?.map((item) => item.action));
  const integration = manifest.integrations?.find((item) => !declared.has(item.permission));

  if (integration) {
    throw fail(
      'UNKNOWN_PERMISSION',
      `Integration "${integration.key}" needs ${integration.permission}, which the manifest's permissions don't declare`,
      { permissions: [integration.permission] },
    );
  }

  const keys = new Set(manifest.integrations?.map((item) => item.key));
  const action = manifest.actions?.find((item) => item.integration && !keys.has(item.integration));

  if (action) {
    throw fail(
      'UNKNOWN_INTEGRATION',
      `Action "${action.type}" names the integration "${action.integration}", which the manifest's integrations don't declare`,
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

/** A plugin uses the connections of core's integrations that sign in with OAuth, each once. */
const usableConnections = (manifest: PluginManifest) => {
  const uses = manifest.connections ?? [];

  const wrong = uses.find(
    ({ integration }) => !INTEGRATIONS.some((item) => item.key === integration && item.oauth),
  );

  if (wrong) {
    throw fail(
      'UNKNOWN_INTEGRATION',
      `connections names "${wrong.integration}", which isn't one of core's integrations that sign in with OAuth`,
    );
  }

  if (new Set(uses.map((use) => use.integration)).size !== uses.length) {
    throw fail('UNKNOWN_INTEGRATION', 'connections names an integration twice');
  }

  const joined = manifest.integrations?.find(
    ({ connection }) => connection && !uses.some((use) => use.integration === connection),
  );

  if (joined) {
    throw fail(
      'UNKNOWN_INTEGRATION',
      `Integration "${joined.key}" connects through "${joined.connection}", which the manifest's connections don't name`,
    );
  }
};

/**
 * What the schema can't check: the manifest's names are the plugin's own, and what it grants or
 * needs names permissions it declares. Throws the first problem.
 */
export const checkManifest = (plugin: string, manifest: PluginManifest) => {
  namespaced(
    plugin,
    manifest.permissions?.map((item) => item.action),
    'Permission actions',
  );
  ownPermissionSets(manifest);
  ownTransfers(plugin, manifest);
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

  ownRelations(plugin, manifest);
  ownIntegrations(manifest);
  othersReads(plugin, manifest);
  usableConnections(manifest);
};
