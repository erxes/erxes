import { Permissions, Users, UsersGroups } from '../../db/models';
import { IPermissionDocument } from '../../db/models/definitions/permissions';
import { IUserDocument } from '../../db/models/definitions/users';
import { get, set } from '../../inmemoryStorage';
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
    modulesMap[module.name] = module.description;

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

export const can = async (
  action: string,
  user: IUserDocument
): Promise<boolean> => {
  if (!user || !user._id) {
    return false;
  }

  if (user.isOwner) {
    return true;
  }

  const actionMap: IActionMap = await getUserActionsMap(user);

  return actionMap[action] === true;
};

interface IActionMap {
  [key: string]: boolean;
}

const getKey = (user: IUserDocument) => `user_permissions_${user._id}`;

/*
 * Get given users permission map from inmemory storage or database
 */
export const getUserActionsMap = async (
  user: IUserDocument
): Promise<IActionMap> => {
  const key = getKey(user);
  const permissionCache = await get(key);

  let actionMap: IActionMap;

  if (permissionCache && permissionCache !== '{}') {
    actionMap = JSON.parse(permissionCache);
  } else {
    actionMap = await userActionsMap(user);

    set(key, JSON.stringify(actionMap));
  }

  return actionMap;
};

/*
 * Get allowed actions
 */
export const getUserAllowedActions = async (
  user: IUserDocument
): Promise<string[]> => {
  const map = await getUserActionsMap(user);

  const allowedActions: string[] = [];

  for (const key of Object.keys(map)) {
    if (map[key]) {
      allowedActions.push(key);
    }
  }

  return allowedActions;
};

/*
 * Reset permissions map for all users
 */
export const resetPermissionsCache = async () => {
  const users = await Users.find({});

  for (const user of users) {
    const key = getKey(user);

    set(key, '');
  }
};

export const userActionsMap = async (
  user: IUserDocument
): Promise<IActionMap> => {
  const userPermissions = await Permissions.find({ userId: user._id });
  const groupPermissions = await Permissions.find({
    groupId: { $in: user.groupIds }
  });

  const totalPermissions: IPermissionDocument[] = [
    ...userPermissions,
    ...groupPermissions,
    ...(user.customPermissions || [])
  ];
  const allowedActions: IActionMap = {};

  const check = (name: string, allowed: boolean) => {
    if (typeof allowedActions[name] === 'undefined') {
      allowedActions[name] = allowed;
    }

    // if a specific permission is denied elsewhere, follow that rule
    if (allowedActions[name] && !allowed) {
      allowedActions[name] = false;
    }
  };

  for (const { requiredActions, allowed, action } of totalPermissions) {
    if (requiredActions.length > 0) {
      for (const actionName of requiredActions) {
        check(actionName, allowed);
      }
    } else {
      check(action, allowed);
    }
  }

  return allowedActions;
};

/**
 * If a permission is added or removed from the constants & forgotten from required actions,
 * this util will fix that.
 */
export const fixPermissions = async (): Promise<string[]> => {
  const modules = Object.getOwnPropertyNames(moduleObjects);
  const result: string[] = [];

  for (const mod of modules) {
    const moduleItem: IModuleMap = moduleObjects[mod];

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

        const permissions: IPermissionDocument[] = await Permissions.find({
          module: mod,
          action: allAction.name,
          $or: [
            { requiredActions: { $eq: null } },
            { requiredActions: { $not: { $size: mostActions.length } } }
          ]
        }).lean();

        for (const perm of permissions) {
          await Permissions.updateOne(
            { _id: perm._id },
            { $set: { requiredActions: mostActions } }
          );

          let message = '';

          if (perm.userId) {
            const user = await Users.findOne({ _id: perm.userId });

            message = user
              ? `user "${user.email || user.username}"`
              : perm.userId;
          }
          if (perm.groupId) {
            const group = await UsersGroups.findOne({ _id: perm.groupId });

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
