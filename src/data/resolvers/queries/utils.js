export class BasicPermissions {
  static setPermissionsForList(cls, methodName) {
    const oldMethod = cls[methodName];

    cls[methodName] = (root, object2, { user }) => {
      console.log('user: ', user);
      if (!user) {
        return [];
      }

      return oldMethod(root, object2, { user });
    };
  }
}

export default {
  BasicPermissions,
};
