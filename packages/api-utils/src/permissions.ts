import { sendRPCMessage } from './messageBroker';
import redis from './redis';

export interface IUser {
  _id: string;
  isOnwer?: boolean;
  [x: string]: any;
}

export interface IActionMap {
  [key: string]: boolean;
}

export interface IPermissionContext {
  user?: IUser;
  [x: string]: any;
}

export const checkLogin = (user?: IUser) => {
  if (!user || !user._id) {
    throw new Error('Login required');
  }
};

export const getKey = (user: IUser) => `user_permissions_${user._id}`;

const resolverWrapper = async (methodName, args, context) => {
  const value = await redis.get('beforeResolvers');
  const beforeResolvers = JSON.parse(value || '{}');

  let results = {};

  if (beforeResolvers[methodName] && beforeResolvers[methodName].length) {
    for (const service of beforeResolvers[methodName]) {
      results = {
        ...results,
        ...(await sendRPCMessage(`${service}:beforeResolver`, {
          subdomain: context.subdomain,
          data: {
            resolver: methodName,
            args
          }
        }))
      };
    }
  }

  return { ...args, ...results };
};

export const permissionWrapper = (
  cls: any,
  methodName: string,
  checkers: any
) => {
  const oldMethod = cls[methodName];

  cls[methodName] = async (
    root: any,
    args: any,
    context: IPermissionContext,
    info: any
  ) => {
    const { user } = context;

    for (const checker of checkers) {
      checker(user);
    }

    args = await resolverWrapper(methodName, args, context);

    return oldMethod(root, args, context, info);
  };
};

export const getUserActionsMap = async (
  user: IUser
): Promise<IActionMap | null> => {
  const key = getKey(user);
  const actionMapJson = await redis.get(key);

  if (!actionMapJson) {
    return null;
  }
  return JSON.parse(actionMapJson);
};

export const can = async (action: string, user?: IUser): Promise<boolean> => {
  if (!user || !user._id) {
    return false;
  }

  if (user.isOwner) {
    return true;
  }

  const actionMap = await getUserActionsMap(user);

  if (!actionMap) {
    return false;
  }

  return actionMap[action] === true;
};

export const checkPermission = async (
  cls: any,
  methodName: string,
  actionName: string,
  defaultValue?: any
) => {
  const oldMethod = cls[methodName];

  cls[methodName] = async (
    root: any,
    args: any,
    context: { user?: IUser; [x: string]: any },
    info: any
  ) => {
    const { user } = context;

    checkLogin(user);

    const allowed = await can(actionName, user);

    if (!allowed) {
      if (defaultValue) {
        return defaultValue;
      }

      throw new Error('Permission required');
    }

    args = await resolverWrapper(methodName, args, context);

    return oldMethod(root, args, context, info);
  };
};

export const requireLogin = (cls: any, methodName: string) =>
  permissionWrapper(cls, methodName, [checkLogin]);

export const moduleRequireLogin = (mdl: any) => {
  for (const method in mdl) {
    if (mdl.hasOwnProperty(method)) {
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
  defaultValue?: any
) => {
  for (const method in mdl) {
    if (mdl.hasOwnProperty(method)) {
      await checkPermission(mdl, method, action, defaultValue);
    }
  }
};
