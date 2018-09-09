import { IUserDocument } from '../db/models/definitions/users';
import { ROLES } from './constants';

/**
 * Checks whether user is logged in or not
 */
export const checkLogin = (user: IUserDocument) => {
  if (!user) {
    throw new Error('Login required');
  }
};

/**
 * Checks if user is logged and if user is admin
 */
export const checkAdmin = (user: IUserDocument) => {
  if (!user.isOwner && user.role !== ROLES.ADMIN) {
    throw new Error('Permission required');
  }
};

/**
 * Wraps object property (function) with permission checkers
 */
export const permissionWrapper = (cls: any, methodName: string, checkers: any) => {
  const oldMethod = cls[methodName];

  cls[methodName] = (root, args, { user }) => {
    for (const checker of checkers) {
      checker(user);
    }

    return oldMethod(root, args, { user });
  };
};

/**
 * Wraps a method with 'Login required' permission checker
 */
export const requireLogin = (cls: any, methodName: string) => permissionWrapper(cls, methodName, [checkLogin]);

/**
 * Wraps a method with 'Permission required' permission checker
 */
export const requireAdmin = (cls: any, methodName: string) =>
  permissionWrapper(cls, methodName, [checkLogin, checkAdmin]);

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
 * Wraps all properties (methods) of a given object with 'Permission required' permission checker
 */
export const moduleRequireAdmin = (mdl: any) => {
  for (const method in mdl) {
    if (mdl.hasOwnProperty(method)) {
      requireAdmin(mdl, method);
    }
  }
};

export default {
  requireLogin,
  requireAdmin,
  moduleRequireLogin,
  moduleRequireAdmin,
};
