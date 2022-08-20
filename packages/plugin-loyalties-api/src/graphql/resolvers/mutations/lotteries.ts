import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { IBuyParams } from '../../../models/definitions/common';
import { ILottery } from '../../../models/definitions/lotteries';

const lotteriesMutations = {
  async lotteriesAdd(_root, doc: ILottery, { models }: IContext) {
    return models.Lotteries.createLottery(doc);
  },

  async lotteriesEdit(
    _root,
    { _id, ...doc }: ILottery & { _id: string },
    { models, user }: IContext
  ) {
    return models.Lotteries.updateLottery(_id, { ...doc, userId: user._id });
  },

  async lotteriesRemove(
    _root,
    { _ids }: { _ids: string[] },
    { models }: IContext
  ) {
    return models.Lotteries.removeLotteries(_ids);
  },

  async buyLottery(_root, param: IBuyParams, { models }: IContext) {
    return models.Lotteries.buyLottery(param);
  }
};

checkPermission(lotteriesMutations, 'lotteriesAdd', 'manageLoyalties');
checkPermission(lotteriesMutations, 'lotteriesEdit', 'manageLoyalties');
checkPermission(lotteriesMutations, 'lotteriesRemove', 'manageLoyalties');

export default lotteriesMutations;
