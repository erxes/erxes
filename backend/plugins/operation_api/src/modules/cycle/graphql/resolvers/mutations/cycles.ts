import { ICycle } from '@/cycle/types';
import { IContext } from '~/connectionResolvers';

export const cycleMutations = {
  createCycle: async (
    _parent: undefined,
    { input }: { input: ICycle },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('cycleCreate');

    return models.Cycle.createCycle({ doc: input });
  },

  updateCycle: async (
    _parent: undefined,
    { input }: { input: Partial<ICycle> & { _id?: string } },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('cycleUpdate');

    if (!input._id) {
      throw new Error('input with _id is required');
    }

    return models.Cycle.updateCycle({ ...input, _id: input._id });
  },

  removeCycle: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('cycleRemove');

    return models.Cycle.removeCycle({ _id });
  },

  endCycle: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models, subdomain, checkPermission }: IContext,
  ) => {
    await checkPermission('cycleEnd');

    return models.Cycle.endCycle(_id, subdomain);
  },
};
