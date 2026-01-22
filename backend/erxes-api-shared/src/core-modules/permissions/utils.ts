import { IPermissionContext, IUserDocument, Resolver } from '../../core-types';
import { getEnv } from '../../utils';
import { getUserActionsMap } from './user-actions-map';

export const getKey = (user: IUserDocument) => `user_permissions_${user._id}`;

export const checkLogin = (user?: IUserDocument) => {
  if (!user || !user._id) {
    throw new Error('Login required');
  }
};

export const permissionWrapper = (
  cls: any,
  methodName: string,
  checkers: any,
) => {
  const oldMethod = cls[methodName];

  cls[methodName] = async (
    root: any,
    args: any,
    context: IPermissionContext,
    info: any,
  ) => {
    const { user } = context;

    for (const checker of checkers) {
      checker(user);
    }

    return oldMethod(root, args, context, info);
  };
};

export const can = async (
  subdomain: string,
  action: string,
  user?: IUserDocument,
): Promise<boolean> => {
  if (!user || !user._id) {
    return false;
  }

  if (user.isOwner) {
    return true;
  }

  const actionMap = await getUserActionsMap(subdomain, user);

  if (!actionMap) {
    return false;
  }

  return actionMap[action] === true;
};

/*
 * Get allowed actions
 */
export const getUserAllowedActions = async (
  subdomain: string,
  user: any,
): Promise<string[]> => {
  const map = await getUserActionsMap(subdomain, user);

  const allowedActions: string[] = [];

  for (const key of Object.keys(map)) {
    if (map[key]) {
      allowedActions.push(key);
    }
  }

  return allowedActions;
};

export const checkPermission = async (
  cls: any,
  methodName: string,
  actionName: string,
  defaultValue?: any,
) => {
  const oldMethod = cls[methodName];

  cls[methodName] = async (
    root: any,
    args: any,
    context: { user?: IUserDocument; [x: string]: any },
    info: any,
  ) => {
    const { user, subdomain } = context;

    checkLogin(user);

    const allowed = await can(subdomain, actionName, user);

    if (!allowed) {
      if (defaultValue) {
        return defaultValue;
      }

      throw new Error('Permission required');
    }

    const VERSION = getEnv({ name: 'VERSION' });

    const NODE_ENV = getEnv({ name: 'NODE_ENV' });

    if (VERSION && VERSION === 'saas' && NODE_ENV === 'production') {
      //   await checkOrganizationCharge({
      //     actionName,
      //     methodName,
      //     context,
      //     params: args,
      //   });
    }

    return oldMethod(root, args, context, info);
  };
};

export const requireLogin = (cls: any, methodName: string) =>
  permissionWrapper(cls, methodName, [checkLogin]);

export const moduleRequireLogin = (mdl: any) => {
  for (const method in mdl) {
    if (Object.prototype.hasOwnProperty.call(mdl, method)) {
      requireLogin(mdl, method);
    }
  }
};

/**
 * Wraps all properties (methods) of a given object with 'Permission action required' permission checker
 */
export const moduleCheckPermission = async (
  mdl: any,
  action: string,
  defaultValue?: any,
) => {
  for (const method in mdl) {
    if (Object.prototype.hasOwnProperty.call(mdl, method)) {
      await checkPermission(mdl, method, action, defaultValue);
    }
  }
};

export const checkRolePermission = async (
  user: IUserDocument,
  resolverKey: string,
) => {
  const { role } = user || {};

  if (!role) {
    return false;
  }

  if (
    role === 'member' &&
    ['remove', 'delete'].some((resolver) =>
      resolverKey.toLowerCase().includes(resolver),
    )
  ) {
    return false;
  }

  return true;
};

export const wrapPermission = (resolver: Resolver, resolverKey: string) => {
  return async (parent: any, args: any, context: any, info: any) => {
    const { user } = context;

    checkLogin(user);

    const permission = await checkRolePermission(user, resolverKey);

    if (!permission) {
      throw new Error('Permission denied');
    }

    return resolver(parent, args, context, info);
  };
};

export const wrapPublicResolver = (resolver: Resolver, wrapperConfig: any) => {
  return async (parent: any, args: any, context: any, info: any) => {
    const { cpUserRequired, forClientPortal } = wrapperConfig || {};

    if (forClientPortal) {
      if (!context.clientPortal) {
        throw new Error('Client portal required');
      }

      if (cpUserRequired && !context.cpUser) {
        throw new Error('Client portal user required');
      }
    }

    return resolver(parent, args, context, info);
  };
};
