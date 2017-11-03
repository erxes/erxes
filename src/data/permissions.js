export const requireLogin = (cls, methodName) => {
  const oldMethod = cls[methodName];

  console.log('oldMethod: ', oldMethod);
  console.log('cls: ', cls);
  console.log('methodName: ', methodName);

  cls[methodName] = (root, object2, { user }) => {
    if (!user) {
      throw new Error('Login required');
    }

    return oldMethod(root, object2, { user });
  };
  console.log('cls[methodName]: ', cls[methodName]);
  console.log('cls2: ', cls);
};

export default {
  requireLogin,
};
