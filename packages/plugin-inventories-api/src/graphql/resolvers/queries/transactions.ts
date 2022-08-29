import { IContext } from '../../../connectionResolver';

const transactionQueries = {
  transactions: async (_root: any, params: any, { models }: IContext) => {
    const limit = params.perPage || 20;
    const skip = params.page ? (params.page - 1) * limit : 0;

    return await models.Transactions.find()
      .skip(skip || 0)
      .limit(limit || 100);
  },

  transactionDetail: async (
    _root: any,
    { _id }: { _id: string },
    { models }: IContext
  ) => {
    return await models.Transactions.getTransactionDetail(_id);
  }
};

export default transactionQueries;
