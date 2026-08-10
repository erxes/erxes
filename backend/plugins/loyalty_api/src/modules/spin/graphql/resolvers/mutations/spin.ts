import { ISpin } from '@/spin/@types/spin';
import { IContext } from '~/connectionResolvers';
import { IBuyParams } from '~/utils';

export const spinsMutations = {
  async spinsAdd(
    _root: undefined,
    doc: ISpin,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('spinCreate');
    return models.Spins.createSpin(doc);
  },

  async spinsEdit(
    _root: undefined,
    { _id, ...doc }: ISpin & { _id: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('spinEdit');
    return models.Spins.updateSpin(_id, { ...doc, userId: user._id });
  },

  async spinsRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('spinRemove');
    return models.Spins.removeSpins(_ids);
  },

  async buySpin(
    _root: undefined,
    param: IBuyParams,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('spinBuy');
    return models.Spins.buySpin(param);
  },

  async doSpin(
    _root: undefined,
    spinId: string,
    { models, checkPermission, subdomain }: IContext,
  ) {
    await checkPermission('spinDo');
    return models.Spins.doSpin(spinId);
  },
};
