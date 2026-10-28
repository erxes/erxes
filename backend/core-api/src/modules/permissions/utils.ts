import {
  IDefaultPermissionGroup,
  IPermissionConfig,
  IPermissionModule,
} from 'erxes-api-shared/core-types';
import { getPlugin, getPlugins } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { permissions as corePermissions } from '~/meta/permissions';

const SEEDED_PLUGINS_CONFIG = 'PERMISSION_TEMPLATES_SEEDED';

export const FALLBACK_GROUP_ID = 'core:admin';

const READ_ACTION_NAME = /^(show|view|read)|(Read|View|Show)$/;

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const generateTemplates = (
  plugin: string,
  modules: IPermissionModule[],
): IDefaultPermissionGroup[] => {
  const title = capitalize(plugin);

  const viewerPermissions = modules
    .map((module) => ({
      plugin,
      module: module.name,
      actions: module.actions
        .filter((action) =>
          action.readOnly === undefined
            ? READ_ACTION_NAME.test(action.name)
            : action.readOnly,
        )
        .map((action) => action.name),
      scope: 'all',
    }))
    .filter((permission) => permission.actions.length);

  const templates: IDefaultPermissionGroup[] = [
    {
      id: `${plugin}:admin`,
      name: `${title} Admin`,
      description: `Full access to ${title}`,
      permissions: modules.map((module) => ({
        plugin,
        module: module.name,
        actions: ['*'],
        scope: 'all',
      })),
    },
  ];

  if (viewerPermissions.length) {
    templates.push({
      id: `${plugin}:viewer`,
      name: `${title} Viewer`,
      description: `Read-only access to ${title}`,
      permissions: viewerPermissions,
    });
  }

  return templates;
};

export const getPermissionTemplates = (
  plugin: string,
  config?: IPermissionConfig,
): IDefaultPermissionGroup[] => {
  if (config?.defaultGroups?.length) {
    return config.defaultGroups;
  }

  if (!config?.modules?.length) {
    return [];
  }

  return generateTemplates(plugin, config.modules);
};

const getPluginPermissionConfig = async (
  plugin: string,
): Promise<IPermissionConfig | undefined | null> => {
  if (plugin === 'core') {
    return corePermissions;
  }

  const service = await getPlugin(plugin);

  if (!service?.address) {
    return null;
  }

  return service.config?.meta?.permissions;
};

export const getPluginTemplates = async (plugin: string) =>
  getPermissionTemplates(
    plugin,
    (await getPluginPermissionConfig(plugin)) || undefined,
  );

const insertTemplates = async (
  models: IModels,
  plugin: string,
  templates: IDefaultPermissionGroup[],
) => {
  for (const template of templates) {
    await models.PermissionGroups.updateOne(
      { _id: template.id },
      {
        $setOnInsert: {
          name: template.name,
          description: template.description,
          plugin,
          templateId: template.id,
          permissions: template.permissions,
        },
      },
      { upsert: true },
    );
  }
};

const seedPermissionGroups = async (
  models: IModels,
  plugins: string[],
): Promise<boolean> => {
  const seededPlugins: string[] = await models.Configs.getConfigValue(
    SEEDED_PLUGINS_CONFIG,
    [],
  );

  const newlySeeded: string[] = [];
  let isComplete = true;

  for (const plugin of plugins) {
    if (seededPlugins.includes(plugin)) continue;

    const config = await getPluginPermissionConfig(plugin);

    if (config === null) {
      isComplete = false;
      continue;
    }

    await insertTemplates(
      models,
      plugin,
      getPermissionTemplates(plugin, config),
    );

    newlySeeded.push(plugin);
  }

  if (newlySeeded.length) {
    await models.Configs.updateOne(
      { code: SEEDED_PLUGINS_CONFIG },
      { $addToSet: { value: { $each: newlySeeded } } },
      { upsert: true },
    );
  }

  if (!(await models.PermissionGroups.exists({}))) {
    const fallback = getPermissionTemplates('core', corePermissions).find(
      ({ id }) => id === FALLBACK_GROUP_ID,
    );

    if (fallback) {
      await insertTemplates(models, 'core', [fallback]);
    }
  }

  return isComplete;
};

const seededTenants = new Map<string, Promise<boolean>>();

export const ensurePermissionGroups = async (
  models: IModels,
  subdomain: string,
) => {
  const plugins = await getPlugins();
  const key = `${subdomain}|${plugins.join(',')}`;

  let seeding = seededTenants.get(key);

  if (!seeding) {
    seeding = seedPermissionGroups(models, plugins);
    seededTenants.set(key, seeding);
  }

  try {
    if (!(await seeding)) {
      seededTenants.delete(key);
    }
  } catch (e) {
    seededTenants.delete(key);
    throw e;
  }
};
