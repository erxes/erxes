import redis from "./redis";

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
    throw new Error("Login required");
  }
};

export const getKey = (user: IUser) => `user_permissions_${user._id}`;

export const permissionWrapper = (
  cls: any,
  methodName: string,
  checkers: any
) => {
  const oldMethod = cls[methodName];

  cls[methodName] = (
    root: any,
    args: any,
    context: IPermissionContext,
    info: any
  ) => {
    const { user } = context;

    for (const checker of checkers) {
      checker(user);
    }

    return oldMethod(root, args, context, info);
  };
};

export const getUserActionsMap = async (user: IUser): Promise<IActionMap | null> => {
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

  if(!actionMap) {
    throw new Error(`User permission not found in Redis storage. user._id = ${user._id}`);
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

      throw new Error("Permission required");
    }

    return oldMethod(root, args, context, info);
  };
};

export const requireLogin = (cls: any, methodName: string) =>
  permissionWrapper(cls, methodName, [checkLogin]);

