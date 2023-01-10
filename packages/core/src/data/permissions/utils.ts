import { IModels } from '../../connectionResolver';
import { IPermissionDocument } from '../../db/models/definitions/permissions';
import { getKey } from '@erxes/api-utils/src';
import { set } from '../../inmemoryStorage';
import { moduleObjects } from './actions/permission';

export interface IModuleMap {
  name: string;
  description?: string;
  actions?: IActionsMap[];
}

export interface IActionsMap {
  name?: string;
  module?: string;
  description?: string;
  use?: string[];
}

// Schema: {name: description}
export const modulesMap: IModuleMap[] = [];

/*
Schema:
  {
    name: {
      module: '', // module name
      description: '', // human friendly description
      use: [<action_names>] // Optional: required actions
    }
  }
*/
export const actionsMap: IActionsMap = {};

export const registerModule = (modules: any): void => {
  const moduleKeys = Object.keys(modules);

  for (const key of moduleKeys) {
    const module = modules[key];

    if (!module.actions) {
      throw new Error(`Actions not found in module`);
    }

    // check module, actions duplicate
    if (modulesMap[module.name]) {
      throw new Error(`"${module.name}" module has been registered`);
    }

    if (module.actions) {
      for (const action of module.actions) {
        if (!action.name) {
          throw new Error(`Action name is missing`);
        }

        if (actionsMap[action.name]) {
          throw new Error(`"${action.name}" action has been registered`);
        }
      }
    }

    // save
    modulesMap[module.name] = module;

    if (module.actions) {
      for (const action of module.actions) {
        if (!action.name) {
          throw new Error('Action name is missing');
        }

        actionsMap[action.name] = {
          module: module.name,
          description: action.description
        };

        if (action.use) {
          actionsMap[action.name].use = action.use;
        }
      }
    }
  }
};

/*
 * Reset permissions map for all users
 */
export const resetPermissionsCache = async (models: IModels) => {
  const users = await models.Users.find({});

  for (const user of users) {
    const key = getKey(user);

    set(key, '');
  }
};

/**
 * If a permission is added or removed from the constants & forgotten from required actions,
 * this util will fix that.
 */
export const fixPermissions = async (
  models: IModels,
  externalObjects?
): Promise<string[]> => {
  const permissionObjects = { ...moduleObjects, ...(externalObjects || {}) };
  const modules = Object.getOwnPropertyNames(permissionObjects);
  const result: string[] = [];

  for (const mod of modules) {
    const moduleItem: IModuleMap = permissionObjects[mod];

    if (moduleItem && moduleItem.actions) {
      const allAction: IActionsMap | undefined = moduleItem.actions.find(
        a => a.description === 'All'
      );
      const otherActions = moduleItem.actions
        .filter(a => a.description !== 'All')
        .map(a => a.name);

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

        const permissions: IPermissionDocument[] = await models.Permissions.find(
          {
            module: mod,
            action: allAction.name,
            $or: [
              { requiredActions: { $eq: null } },
              { requiredActions: { $not: { $size: mostActions.length } } }
            ]
          }
        ).lean();

        for (const perm of permissions) {
          await models.Permissions.updateOne(
            { _id: perm._id },
            { $set: { requiredActions: mostActions } }
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
              _id: perm.groupId
            });

            message = group ? `user group "${group.name}"` : perm.groupId;
          }

          result.push(
            `Permission "${allAction.name}" of module "${mod}" has been fixed for ${message}`
          );
        }
      } // end allAction checking
    } // end module item checking
  } // end module name loop

  return result;
};
