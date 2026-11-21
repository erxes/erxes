import { type PluginManifest, pluginIntegrationRef } from '@erxes/core-contract';
import { fail } from '~/http/errors';

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

/** Reads name another plugin, with that plugin's permissions only. */
const othersReads = (plugin: string, manifest: PluginManifest) => {
  for (const read of manifest.pluginReads ?? []) {
    if (read.plugin === plugin) {
      throw fail('NAMESPACE_REQUIRED', `pluginReads names ${plugin} itself`);
    }

    namespaced(read.plugin, read.permissions, `Reads of ${read.plugin}`);
  }
};

interface AccountRef {
  integration?: string;
  accountKind?: string;
}

/** Integrations need the plugin's API and one of its permissions; whatever names one names its own, with a kind it declares. */
const ownIntegrations = (plugin: string, manifest: PluginManifest) => {
  const integrations = manifest.integrations ?? [];
  const permissions = new Set(manifest.permissions?.map((item) => item.action));

  const kindsOf = new Map(
    integrations.map((item) => [
      pluginIntegrationRef(plugin, item.key),
      new Set(item.accounts.map((account) => account.kind)),
    ]),
  );

  if (integrations.length && !manifest.api) {
    throw fail('INVALID_REFERENCE', 'Integrations need the manifest to name its api', {
      field: 'api',
    });
  }

  const unknown = integrations.find((item) => item.permission && !permissions.has(item.permission));

  if (unknown?.permission) {
    throw fail(
      'UNKNOWN_PERMISSION',
      `Integration "${unknown.key}" needs ${unknown.permission}, which the manifest's permissions don't declare`,
      { permissions: [unknown.permission] },
    );
  }

  const check = (what: string, ref: AccountRef) => {
    const kinds = ref.integration === undefined ? undefined : kindsOf.get(ref.integration);

    if (ref.integration !== undefined && !kinds) {
      throw fail(
        'INVALID_REFERENCE',
        `${what} names the integration ${ref.integration}, which the manifest doesn't declare (${plugin}.<key>)`,
        { field: 'integration' },
      );
    }

    if (ref.accountKind !== undefined && !kinds?.has(ref.accountKind)) {
      throw fail(
        'INVALID_REFERENCE',
        `${what} names the account kind ${ref.accountKind}, which its integration doesn't declare`,
        { field: 'accountKind' },
      );
    }
  };

  for (const action of manifest.actions ?? []) {
    check(`Action ${action.type}`, action);
    action.outputs?.forEach((field) => check(`Action ${action.type}'s output ${field.key}`, field));
  }

  for (const event of manifest.events ?? []) {
    event.fields?.forEach((field) => check(`Event ${event.type}'s field ${field.key}`, field));
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
  othersReads(plugin, manifest);
  ownIntegrations(plugin, manifest);
};
