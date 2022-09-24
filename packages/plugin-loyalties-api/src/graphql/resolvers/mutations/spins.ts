import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { IBuyParams } from '../../../models/definitions/common';
import { ISpin } from '../../../models/definitions/spins';

const spinsMutations = {
  async spinsAdd(_root, doc: ISpin, { models }: IContext) {
    return models.Spins.createSpin(doc);
  },

  async spinsEdit(
    _root,
    { _id, ...doc }: ISpin & { _id: string },
    { models, user }: IContext
  ) {
    return models.Spins.updateSpin(_id, { ...doc, userId: user._id });
  },

  async spinsRemove(_root, { _ids }: { _ids: string[] }, { models }: IContext) {
    return models.Spins.removeSpins(_ids);
  },

  async buySpin(_root, param: IBuyParams, { models }: IContext) {
    return models.Spins.buySpin(param);
  },

  async doSpin(_root, spinId, { models }: IContext) {
    return models.Spins.doSpin(spinId);
  }
};

checkPermission(spinsMutations, 'spinsAdd', 'manageLoyalties');
checkPermission(spinsMutations, 'spinsEdit', 'manageLoyalties');
checkPermission(spinsMutations, 'spinsRemove', 'manageLoyalties');

export default spinsMutations;
