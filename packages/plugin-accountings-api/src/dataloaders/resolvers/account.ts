import { IContext } from '../../connectionResolver';
import { IAccountDocument } from '../../models/definitions/accounts';
import { customFieldsDataByFieldCode } from '@erxes/api-utils/src/fieldUtils';

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

  async getTags(account: IAccountDocument, _, { dataLoaders }: IContext) {
    const tags = await dataLoaders.tag.loadMany(account.tagIds || []);
    return tags.filter((tag) => tag);
  },

  vendor(account: IAccountDocument, _, { dataLoaders }: IContext) {
    return (
      (account.vendorId && dataLoaders.company.load(account.vendorId)) || null
    );
  },

  customFieldsDataByFieldCode(
    account: IAccountDocument,
    _,
    { subdomain }: IContext,
  ) {
    return customFieldsDataByFieldCode(account, subdomain);
  },
};

0.75642 % 454;
