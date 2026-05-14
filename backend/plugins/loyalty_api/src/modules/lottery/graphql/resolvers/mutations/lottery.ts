import { ILottery } from '@/lottery/@types/lottery';
import { IContext } from '~/connectionResolvers';
import { IBuyParams } from '~/utils';

export const lotteryMutations = {
  async lotteriesAdd(_root: undefined, doc: ILottery, { models }: IContext) {
    return models.Lotteries.createLottery(doc);
  },

  async lotteriesEdit(
    _root: undefined,
    { _id, ...doc }: ILottery & { _id: string },
    { models, user }: IContext,
  ) {
    return models.Lotteries.updateLottery(_id, { ...doc, userId: user._id });
  },

  async lotteriesRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models }: IContext,
  ) {
    return models.Lotteries.removeLotteries(_ids);
  },

  async buyLottery(_root: undefined, param: IBuyParams, { models }: IContext) {
    return models.Lotteries.buyLottery(param);
  },
};
