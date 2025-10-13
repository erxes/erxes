import { IPermissionContext, IUserDocument, Resolver } from '../../core-types';
import { getEnv, redis, sendTRPCMessage } from '../../utils';
import { getUserActionsMap } from './user-actions-map';

export const getKey = (user: IUserDocument) => `user_permissions_${user._id}`;

export const checkLogin = (user?: IUserDocument) => {
  if (!user || !user._id) {
    throw new Error('Login required');
  }
};

const resolverWrapper = async (
  methodName: string,
  args: any,
  context: IPermissionContext,
) => {
  const value = await redis.get('beforeResolvers');
  const beforeResolvers = JSON.parse(value || '{}');

  let results = {};

  if (beforeResolvers[methodName] && beforeResolvers[methodName].length) {
    for (const service of beforeResolvers[methodName]) {
      results = {
        ...results,
        // ...(await sendTRPCMessage({
        //   pluginName: service,
        //   method: 'query',
        //   module: service,
        //   action: 'beforeResolver',
        //   input: {
        //     resolver: methodName,
        //     args,
        //     user: context.user,
        //   },
        //   defaultValue: [],
        // })),
      };
    }
  }

  return { ...args, ...results };
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

    args = await resolverWrapper(methodName, args, context);

    return oldMethod(root, args, context, info);
  };
};

export const can = async (
  action: string,
  user?: IUserDocument,
): Promise<boolean> => {
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

/*
 * Get allowed actions
 */
export const getUserAllowedActions = async (user: any): Promise<string[]> => {
  const map = await getUserActionsMap(user);

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
    const { user } = context;

    checkLogin(user);

    const allowed = await can(actionName, user);

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

    args = await resolverWrapper(methodName, args, context);

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
  subdomain: string,
  userId: string,
  resolverKey: string,
) => {
  const { role } = await sendTRPCMessage({
    pluginName: 'core',
    method: 'query',
    module: 'roles',
    action: 'findOne',
    input: {
      userId,
      resolverKey,
    },
    defaultValue: { role: null },
  });

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
    const { user, subdomain } = context;

    checkLogin(user);

    const permission = await checkRolePermission(
      subdomain,
      user._id,
      resolverKey,
    );

    if (!permission) {
      throw new Error('Permission denied');
    }

    return resolver(parent, args, context, info);
  };
};