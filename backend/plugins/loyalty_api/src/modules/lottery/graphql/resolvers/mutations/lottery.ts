import { ILottery } from '@/lottery/@types/lottery';
import { IContext } from '~/connectionResolvers';
import { IBuyParams } from '~/utils';

export const lotteryMutations = {
  async lotteriesAdd(_root: undefined, doc: ILottery, { models, checkPermission }: IContext) {
    await checkPermission('lotteryCreate');
    return models.Lotteries.createLottery(doc);
  },

  async lotteriesEdit(
    _root: undefined,
    { _id, ...doc }: ILottery & { _id: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('lotteryEdit');
    return models.Lotteries.updateLottery(_id, { ...doc, userId: user._id });
  },

  async lotteriesRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('lotteryRemove');
    return models.Lotteries.removeLotteries(_ids);
  },

  async buyLottery(_root: undefined, param: IBuyParams, { models, checkPermission }: IContext) {
    await checkPermission('lotteryBuy');
    return models.Lotteries.buyLottery(param);
  },
};