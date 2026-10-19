import type { IPermissionConfig } from 'erxes-api-shared/core-types';
import { extensionPermissionsKey } from 'erxes-api-shared/core-modules';
import { redis } from 'erxes-api-shared/utils';
import type { IExtensionDocument, IModels } from './connectionResolver';

// The name an extension has in permissions and in the UI: `loyalty-agents`
// is `loyaltyAgents`. The extension's UI CONFIG.name must match it.
export const pluginName = (extId: string) =>
  extId.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());

// What a function's `permission: 'agents.manage'` checks against.
export const actionName = (extId: string, permission: string) =>
  `${pluginName(extId)}.${permission}`;

const toConfig = (
  ext: Pick<IExtensionDocument, 'extId' | 'permissions'>,
): IPermissionConfig => {
  const plugin = pluginName(ext.extId);
  // Module names carry the plugin, because core merges granted permissions by
  // module name and a plugin may own a module with the same name.
  const modules = Object.entries(ext.permissions).map(([module, actions]) => ({
    name: `${plugin}.${module}`,
    description: module,
    scopes: [{ name: 'all' as const, description: 'All' }],
    actions: Object.entries(actions).map(([action, title]) => ({
      name: actionName(ext.extId, `${module}.${action}`),
      title,
      description: title,
    })),
  }));

  return {
    plugin,
    modules,
    defaultGroups: [
      {
        id: `${plugin}:manager`,
        name: `${ext.extId} managers`,
        description: `Every action of the ${ext.extId} extension`,
        // Explicit names, not '*': the UI's `<Can action>` matches action
        // names exactly against what the group grants.
        permissions: modules.map((module) => ({
          plugin,
          module: module.name,
          actions: module.actions.map((action) => action.name),
          scope: 'all' as const,
        })),
      },
    ],
  };
};

// Replaces the tenant's extension permission configs, which core merges into
// Settings > Permissions and every permission check, and drops the tenant's
// cached action maps so the change applies on the next request.
export const rebuildPermissions = async (
  models: IModels,
  subdomain: string,
) => {
  const exts = await models.Extensions.find({ subdomain, status: 'installed' })
    .select('extId permissions')
    .lean();
  const configs = exts
    .filter((ext) => Object.keys(ext.permissions ?? {}).length > 0)
    .map(toConfig);

  await redis.set(extensionPermissionsKey(subdomain), JSON.stringify(configs));

  // Cached action maps are keyed by user id only, so drop this tenant's
  // users' maps, not every key in Redis.
  let batch: string[] = [];

  for await (const user of models.Extensions.db
    .collection<{ _id: string }>('users')
    .find({}, { projection: { _id: 1 } })) {
    batch.push(`user_actions_${user._id}`);

    if (batch.length === 500) {
      await redis.del(...batch);
      batch = [];
    }
  }

  if (batch.length > 0) {
    await redis.del(...batch);
  }
};
