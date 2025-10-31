import { checkPermission } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';
import { IBuyParams } from '~/modules/loyalty/@types/common';
import { ILottery } from '~/modules/loyalty/@types/lotteries';

const lotteriesMutations = {
  async lotteriesAdd(_root, doc: ILottery, { models }: IContext) {
    return models.Lotteries.createLottery(doc);
  },

  async lotteriesEdit(
    _root,
    { _id, ...doc }: ILottery & { _id: string },
    { models, user }: IContext,
  ) {
    return models.Lotteries.updateLottery(_id, { ...doc, userId: user._id });
  },

  async lotteriesRemove(
    _root,
    { _ids }: { _ids: string[] },
    { models }: IContext,
  ) {
    return models.Lotteries.removeLotteries(_ids);
  },

  async buyLottery(_root, param: IBuyParams, { models }: IContext) {
    return models.Lotteries.buyLottery(param);
  },
};

checkPermission(lotteriesMutations, 'lotteriesAdd', 'manageLoyalties');
checkPermission(lotteriesMutations, 'lotteriesEdit', 'manageLoyalties');
checkPermission(lotteriesMutations, 'lotteriesRemove', 'manageLoyalties');

export default lotteriesMutations;
