import { getKey } from 'erxes-api-shared/core-modules';
import {
  IActionsMap,
  IModuleMap,
  IPermissionDocument,
} from 'erxes-api-shared/core-types';
import { getPlugin, getPlugins, redis } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { moduleObjects } from '~/meta/permission';

export const resetPermissionsCache = async (models: IModels) => {
  const users = await models.Users.find({});

  for (const user of users) {
    const key = getKey(user);

    redis.set(key, '');
  }
};

/**
 * If a permission is added or removed from the constants & forgotten from required actions,
 * this util will fix that.
 */

export const getPermissionModules = async () => {
  const modules: IModuleMap[] = [];

  const services = await getPlugins();

  for (const name of services) {
    const service = await getPlugin(name);
    if (!service) continue;
    if (!service.config) continue;

    const permissions =
      service.config.meta?.permissions || service.config.permissions;

    if (!permissions) continue;

    const moduleKeys = Object.keys(permissions);

    for (const key of moduleKeys) {
      const module = permissions[key];

      modules.push(module);
    }
  }

  return modules.sort((a, b) => a.name.localeCompare(b.name));
};

export const getPermissionActions = async () => {
  const actions: IActionsMap[] = [];

  const services = await getPlugins();

  for (const name of services) {
    const service = await getPlugin(name);
    if (!service) continue;
    if (!service.config) continue;

    const permissions =
      service.config.meta?.permissions || service.config.permissions;

    if (!permissions) continue;

    const moduleKeys = Object.keys(permissions);

    for (const key of moduleKeys) {
      const module = permissions[key];

      if (module.actions) {
        for (const action of module.actions) {
          if (!action.name) continue;

          action.module = module.name;

          actions.push(action);
        }
      }
    }
  }

  return actions;
};

export const getPermissionActionsMap = async (): Promise<IActionsMap> => {
  const actionsMap: IActionsMap = {};

  const services = await getPlugins();

  for (const name of services) {
    const service = await getPlugin(name);
    if (!service) continue;
    if (!service.config) continue;

    const permissions =
      service.config.meta?.permissions || service.config.permissions;

    if (!permissions) continue;

    const moduleKeys = Object.keys(permissions);

    for (const key of moduleKeys) {
      const module = permissions[key];

      if (module.actions) {
        for (const action of module.actions) {
          if (!action.name) continue;

          actionsMap[action.name] = {
            module: module.name,
            description: action.description,
          };

          if (action.use) {
            actionsMap[action.name].use = action.use;
          }
        }
      }
    }
  }

  return actionsMap;
};

export const fixPermissions = async (
  models: IModels,
  externalObjects?,
): Promise<string[]> => {
  const permissionObjects = { ...moduleObjects, ...(externalObjects || {}) };
  const modules = Object.getOwnPropertyNames(permissionObjects);
  const result: string[] = [];

  for (const mod of modules) {
    const moduleItem: IModuleMap = permissionObjects[mod];

    if (moduleItem && moduleItem.actions) {
      const allAction: IActionsMap | undefined = moduleItem.actions.find(
        (a) => a.description === 'All',
      );
      const otherActions = moduleItem.actions
        .filter((a) => a.description !== 'All')
        .map((a) => a.name);

      if (
        allAction &&
        allAction.use &&
        allAction.use.length > 0 &&
        allAction.name
      ) {
        // array with the most actions will be recovered
        const mostActions =
          allAction.use.length > otherActions.length
            ? allAction.use
            : otherActions;

        const permissions: IPermissionDocument[] =
          await models.Permissions.find({
            module: mod,
            action: allAction.name,
            $or: [
              { requiredActions: { $eq: null } },
              { requiredActions: { $not: { $size: mostActions.length } } },
            ],
          }).lean();

        for (const perm of permissions) {
          await models.Permissions.updateOne(
            { _id: perm._id },
            { $set: { requiredActions: mostActions } },
          );

          let message = '';

          if (perm.userId) {
            const user = await models.Users.findOne({ _id: perm.userId });

            message = user
              ? `user "${user.email || user.username}"`
              : perm.userId;
          }
          if (perm.groupId) {
            const group = await models.UsersGroups.findOne({
              _id: perm.groupId,
            });

            message = group ? `user group "${group.name}"` : perm.groupId;
          }

          result.push(
            `Permission "${allAction.name}" of module "${mod}" has been fixed for ${message}`,
          );
        }
      } // end allAction checking
    } // end module item checking
  } // end module name loop

  return result;
};
