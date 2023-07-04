import { IContext } from '../../connectionResolver';
import { sendCommonMessage } from '../../messageBroker';
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

  customFieldsDataByFieldCode(
    account: IAccountDocument,
    _,
    { subdomain }: IContext
  ) {
    return customFieldsDataByFieldCode(account, subdomain, sendCommonMessage);
  }
};
