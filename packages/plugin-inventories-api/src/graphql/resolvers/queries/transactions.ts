import { IContext } from '../../../connectionResolver';

const transactionQueries = {
  async transactions(_root: any, params: any, { models, subdomain }: IContext) {
    return models.Transactions.find();
  },

  async transactionDetail(
    _root: any,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.Transactions.findOne({ _id });
  }
};

export default transactionQueries;
