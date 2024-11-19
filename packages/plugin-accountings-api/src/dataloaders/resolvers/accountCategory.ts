import { escapeRegExp } from '@erxes/api-utils/src/core';
import { IContext } from '../../connectionResolver';
import { IAccountCategoryDocument } from '../../models/definitions/accountCategory';
import { ACCOUNT_STATUSES } from '../../models/definitions/constants';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.AccountCategories.findOne({ _id });
  },

  isRoot(category: IAccountCategoryDocument) {
    return !category.parentId;
  },

  async accountCount(
    category: IAccountCategoryDocument,
    { _ },
    { models }: IContext,
  ) {
    const account_category_ids = await models.AccountCategories.find(
      { order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) } },
      { _id: 1 },
    );
    return models.Accounts.countDocuments({
      categoryId: { $in: account_category_ids },
      status: { $ne: ACCOUNT_STATUSES.DELETED },
    });
  },
};
