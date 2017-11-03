import { ROLES } from './constants';

export const PERMISSIONS = {
  ADMIN: 'admin',
};

export const checkPermission = (permission, user) => {
  if (permission === PERMISSIONS.ADMIN && user.role === ROLES.CONTRIBUTOR) {
    throw new Error('Permission required');
  }
};

export const requireLogin = (cls, methodName, permissions) => {
  const oldMethod = cls[methodName];

  cls[methodName] = (root, object2, { user }) => {
    if (!user) {
      throw new Error('Login required');
    }

    for (let permission of permissions || []) {
      checkPermission(permission, user);
    }

    return oldMethod(root, object2, { user });
  };
};

export const moduleRequireLogin = (mdl, permissions) => {
  for (let method in mdl) {
    requireLogin(mdl, method, permissions);
  }
};

export default {
  requireLogin,
  moduleRequireLogin,
  PERMISSIONS,
};
