export const requireLogin = (cls, methodName) => {
  const oldMethod = cls[methodName];

  cls[methodName] = (root, object2, { user }) => {
    if (!user) {
      throw new Error('Login required');
    }

    return oldMethod(root, object2, { user });
  };
};

export const moduleRequireLogin = mdl => {
  for (let method in mdl) {
    requireLogin(mdl, method);
  }
};

export default {
  requireLogin,
  moduleRequireLogin,
};
