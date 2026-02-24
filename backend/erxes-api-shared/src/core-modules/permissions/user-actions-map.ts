import {
  IBranchDocument,
  IDepartmentDocument,
} from '../../core-types/modules/structure/structure';
import {
  IActionMap,
  IPermissionDocument,
  IUserDocument,
} from '../../core-types';
import { redis, sendTRPCMessage } from '../../utils';
import { getKey } from './utils';

export const userActionsMap = async (
  userPermissions: IPermissionDocument[],
  groupPermissions: IPermissionDocument[],
  user: any,
): Promise<IActionMap> => {
  const totalPermissions: IPermissionDocument[] = [
    ...userPermissions,
    ...groupPermissions,
    ...(user.customPermissions || []),
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

export const getUserActionsMap = async (
  subdomain: string,
  user: IUserDocument,
  permissionsFind?: (query: any) => any,
): Promise<IActionMap> => {
  const key = getKey(user);
  const permissionCache = await redis.get(key);

  let actionMap: IActionMap;

  if (permissionCache && permissionCache !== '{}') {
    actionMap = JSON.parse(permissionCache);
  } else {
    const userPermissionQuery = {
      userId: user._id,
    };

    const userPermissions = await (permissionsFind
      ? permissionsFind(userPermissionQuery)
      : sendTRPCMessage({
          subdomain,

          pluginName: 'core',
          method: 'query',
          module: 'permissions',
          action: 'find',
          input: {
            query: userPermissionQuery,
          },
          defaultValue: [],
        }));

    const groupQuery = { $or: [] as any[] };

    if (user?.branchIds?.length) {
      const branches: IBranchDocument[] = await sendTRPCMessage({
        subdomain,

        pluginName: 'core',
        method: 'query',
        module: 'branches',
        action: 'findWithChild',
        input: {
          query: {
            _id: { $in: user.branchIds },
          },
          fields: {
            _id: 1,
          },
        },
        defaultValue: [],
      });

      groupQuery.$or.push({
        branchIds: { $in: branches.map((branch) => branch._id) },
      });
    }

    if (user?.departmentIds?.length) {
      const departments: IDepartmentDocument[] = await sendTRPCMessage({
        subdomain,

        pluginName: 'core',
        method: 'query',
        module: 'departments',
        action: 'findWithChild',
        input: {
          query: {
            _id: { $in: user.departmentIds },
          },
          fields: {
            _id: 1,
          },
        },
        defaultValue: [],
      });

      groupQuery.$or.push({
        departmentIds: {
          $in: departments.map((department) => department._id),
        },
      });
    }

    let groupIds: string[] = [];

    if (groupQuery?.$or?.length > 0) {
      groupIds = await sendTRPCMessage({
        subdomain,

        pluginName: 'core',
        method: 'query',
        module: 'userGroups',
        action: 'getIds',
        input: {
          query: groupQuery,
        },
        defaultValue: [],
      });
    }

    const groupPermissionQuery = {
      groupId: { $in: [...(user?.groupIds || []), ...groupIds] },
    };

    const groupPermissions = await (permissionsFind
      ? permissionsFind(groupPermissionQuery)
      : sendTRPCMessage({
          subdomain,

          pluginName: 'core',
          method: 'query',
          module: 'permissions',
          action: 'find',
          input: {
            query: groupPermissionQuery,
          },
          defaultValue: [],
        }));

    actionMap = await userActionsMap(userPermissions, groupPermissions, user);

    redis.set(key, JSON.stringify(actionMap));
  }

  return actionMap;
};
