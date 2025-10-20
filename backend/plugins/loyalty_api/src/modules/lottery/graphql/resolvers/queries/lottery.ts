import { IContext } from '~/connectionResolvers';

export const lotteryQueries = {
  getLottery: async (_parent: undefined, { _id }, { models }: IContext) => {
    return models.Lottery.getLottery(_id);
  },

  getLotteries: async (_parent: undefined, { models }: IContext) => {
    return models.Lottery.getLotteries();
  },
};
