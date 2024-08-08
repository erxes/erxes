import { IContext } from '../../connectionResolver';
import { ITrDetail } from '../../models/definitions/transaction';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Transactions.findOne({ 'details._id': _id });
  },

  async account(trDetail: ITrDetail, _, { models }: IContext) {
    return await models.Accounts.getAccount({ _id: trDetail.accountId });
  },
};
