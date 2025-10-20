import { IContext } from '~/connectionResolvers';

export const lotteryMutations = {
  createLottery: async (_parent: undefined, { name }, { models }: IContext) => {
    return models.Lottery.createLottery({ name });
  },

  updateLottery: async (
    _parent: undefined,
    { _id, name },
    { models }: IContext,
  ) => {
    return models.Lottery.updateLottery(_id, { name });
  },

  removeLottery: async (_parent: undefined, { _id }, { models }: IContext) => {
    return models.Lottery.removeLottery(_id);
  },
};
