import { ROLES } from './constants';

export const checkLogin = user => {
  if (!user) {
    throw new Error('Login required');
  }
};

export const checkAdmin = user => {
  if (user.role != ROLES.ADMIN) {
    throw new Error('Permission required');
  }
};

export const permissionWrapper = (cls, methodName, checkers) => {
  const oldMethod = cls[methodName];

  cls[methodName] = (root, object2, { user }) => {
    for (let checker of checkers) {
      checker(user);
    }

    return oldMethod(root, object2, { user });
  };
};

export const requireLogin = (cls, methodName) => permissionWrapper(cls, methodName, [checkLogin]);

export const requireAdmin = (cls, methodName) =>
  permissionWrapper(cls, methodName, [checkLogin, checkAdmin]);

export const moduleRequireLogin = mdl => {
  for (let method in mdl) {
    requireLogin(mdl, method);
  }
};

export const moduleRequireAdmin = mdl => {
  for (let method in mdl) {
    requireAdmin(mdl, method);
  }
};

export default {
  requireLogin,
  requireAdmin,
  moduleRequireLogin,
  moduleRequireAdmin,
};
