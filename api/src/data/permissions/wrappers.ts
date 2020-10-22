import { IUserDocument } from '../../db/models/definitions/users';
import { can } from './utils';

/**
 * Checks whether user is logged in or not
 */
export const checkLogin = (user: IUserDocument) => {
  if (!user) {
    throw new Error('Login required');
  }
};

/**
 * Wraps object property (function) with permission checkers
 */
export const permissionWrapper = (cls: any, methodName: string, checkers: any) => {
  const oldMethod = cls[methodName];

  cls[methodName] = (root, args, context) => {
    const { user } = context;

    for (const checker of checkers) {
      checker(user);
    }

    return oldMethod(root, args, context);
  };
};

/**
 * Wraps a method with 'Login required' permission checker
 */
export const requireLogin = (cls: any, methodName: string) => permissionWrapper(cls, methodName, [checkLogin]);

/**
 * Wraps all properties (methods) of a given object with 'Login required' permission checker
 */
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
export const moduleCheckPermission = async (mdl: any, action: string, defaultValue?: any) => {
  for (const method in mdl) {
    if (mdl.hasOwnProperty(method)) {
      await checkPermission(mdl, method, action, defaultValue);
    }
  }
};

/**
 * Checks if user is logged and if user is can action
 * @param {Object} user - User object
 * @throws {Exception} throws Error('Permission required')
 * @return {null}
 */
export const checkPermission = async (cls: any, methodName: string, actionName: string, defaultValue?: any) => {
  const oldMethod = cls[methodName];

  cls[methodName] = async (root, args, context: { user: IUserDocument }) => {
    const { user } = context;

    checkLogin(user);

    const allowed = await can(actionName, user);

    if (!allowed) {
      if (defaultValue) {
        return defaultValue;
      }

      throw new Error('Permission required');
    }

    return oldMethod(root, args, context);
  };
};
