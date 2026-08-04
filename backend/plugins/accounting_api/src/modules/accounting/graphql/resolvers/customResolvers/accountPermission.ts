import { IContext } from "~/connectionResolvers";
import { IPermissionDocument } from "~/modules/accounting/@types/permission";

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
  }
};
