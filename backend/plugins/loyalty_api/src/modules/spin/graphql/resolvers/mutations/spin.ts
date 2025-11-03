import { IContext } from '~/connectionResolvers';
import { ISpin } from '~/modules/spin/@types/spin';

export const spinsMutations = {
  async createSpin(_root, doc: ISpin, { models, user }: IContext) {
    return models.Spin.createSpin(doc, user);
  },

  async updateSpin(
    _parent: undefined,
    { _id, ...doc }: ISpin & { _id: string },
    { models, user }: IContext,
  ) {
    return models.Spin.updateSpin(_id, doc, user);
  },

  async removeSpin(
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.Spin.removeSpin(_id);
  },

  async buySpin(
    _parent: undefined,
    param: {
      campaignId: string;
      ownerType: string;
      ownerId: string;
      count?: number;
    },
    { models, user }: IContext,
  ) {
    return models.Spin.buySpin(param, user);
  },

  async doSpin(_parent: undefined, spinId, { models, user }: IContext) {
    return models.Spin.doSpin(spinId, user);
  },
};
