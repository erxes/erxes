import { IContext } from '../../../connectionResolver';

const transactionQueries = {
  transactions: async (_root: any, {}, { models }: IContext) => {
    return models.Transactions.find();
  },

  transactionDetail: async (
    _root: any,
    { _id }: { _id: string },
    { models }: IContext
  ) => {
    return models.Transactions.getTransaction(_id);
  }
};

export default transactionQueries;
