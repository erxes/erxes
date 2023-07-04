import { IContext } from '../../connectionResolver';
import {
  IAccountCategoryDocument,
  ACCOUNT_STATUSES
} from '../../models/definitions/accounts';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.AccountCategories.findOne({ _id });
  },

  isRoot(category: IAccountCategoryDocument, {}) {
    return category.parentId ? false : true;
  },

  async accountCount(
    category: IAccountCategoryDocument,
    {},
    { models }: IContext
  ) {
    const account_category_ids = await models.AccountCategories.find(
      { order: { $regex: new RegExp(category.order) } },
      { _id: 1 }
    );
    return models.Accounts.countDocuments({
      categoryId: { $in: account_category_ids },
      status: { $ne: ACCOUNT_STATUSES.DELETED }
    });
  }
};
