import { IContext } from "~/connectionResolvers";
import { ACCOUNT_PERMISSION_SCOPES, ACCOUNT_PERMISSION_WRITE_SCOPES, IPermissionDocument } from "~/modules/accounting/@types/permission";

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Permissions.findOne({ _id });
  },

  async user(permission: IPermissionDocument) {
    if (!permission.userId) {
      return;
    }

    return {
      __typename: 'User',
      _id: permission.userId,
    };
  },

  async account(permission: IPermissionDocument, _, { models }: IContext) {
    return (
      (permission.accountId &&
        await models.Accounts.findOne({ _id: permission.accountId })) ||
      null
    );
  },

  async level(permission: IPermissionDocument) {
    return permission?.level || 0;
  },
  async read(permission: IPermissionDocument) {
    return permission?.read || ACCOUNT_PERMISSION_SCOPES.NONE;
  },
  async write(permission: IPermissionDocument) {
    return permission?.write || ACCOUNT_PERMISSION_WRITE_SCOPES.NONE;
  }
};
