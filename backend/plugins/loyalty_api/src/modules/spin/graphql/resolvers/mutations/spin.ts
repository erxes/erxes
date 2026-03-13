import { ISpin } from '@/spin/@types/spin';
import { IContext } from '~/connectionResolvers';
import { IBuyParams } from '~/utils';

export const spinsMutations = {
  async spinsAdd(_root: undefined, doc: ISpin, { models }: IContext) {
    return models.Spins.createSpin(doc);
  },

  async spinsEdit(
    _root: undefined,
    { _id, ...doc }: ISpin & { _id: string },
    { models, user }: IContext,
  ) {
    return models.Spins.updateSpin(_id, { ...doc, userId: user._id });
  },

  async spinsRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models }: IContext,
  ) {
    return models.Spins.removeSpins(_ids);
  },

  async buySpin(_root: undefined, param: IBuyParams, { models }: IContext) {
    return models.Spins.buySpin(param);
  },

  async doSpin(_root: undefined, spinId: string, { models }: IContext) {
    return models.Spins.doSpin(spinId);
  },
};
