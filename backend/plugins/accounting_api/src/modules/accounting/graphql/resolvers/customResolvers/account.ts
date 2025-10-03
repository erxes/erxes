import { IContext } from "~/connectionResolvers";
import { IAccountDocument } from "~/modules/accounting/@types/account";

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Accounts.findOne({ _id });
  },

  async category(account: IAccountDocument, _, { models }: IContext) {
    return (
      (account.categoryId &&
        await models.AccountCategories.findOne({ _id: account.categoryId })) ||
      null
    );
  },
};
