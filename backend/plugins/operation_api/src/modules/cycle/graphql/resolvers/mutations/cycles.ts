import { IContext } from '~/connectionResolvers';

export const cycleMutations = {
  createCycle: async (
    _parent: undefined,
    { input },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('cycleCreate');

    return models.Cycle.createCycle({ doc: input });
  },

  updateCycle: async (
    _parent: undefined,
    { input },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('cycleUpdate');

    return models.Cycle.updateCycle(input);
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
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('cycleEnd');

    return models.Cycle.endCycle(_id);
  },
};
