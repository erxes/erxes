import { IContext } from '../../connectionResolver';
import { IAccountDocument } from '../../models/definitions/account';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Accounts.findOne({ _id });
  },

  category(account: IAccountDocument, _, { dataLoaders }: IContext) {
    return (
      (account.categoryId &&
        dataLoaders.accountCategory.load(account.categoryId)) ||
      null
    );
  },
};
