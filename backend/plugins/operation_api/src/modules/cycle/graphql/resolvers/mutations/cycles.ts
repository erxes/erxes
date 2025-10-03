import { requireLogin } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';

export const cycleMutations = {
  createCycle: async (_parent: undefined, { input }, { models }: IContext) => {
    const cycle = await models.Cycle.createCycle({ doc: input });
    return cycle;
  },
  updateCycle: async (_parent: undefined, { input }, { models }: IContext) => {
    const cycle = await models.Cycle.updateCycle(input);
    return cycle;
  },
  removeCycle: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.Cycle.removeCycle({ _id });
  },
};

requireLogin(cycleMutations, 'createCycle');
requireLogin(cycleMutations, 'updateCycle');
requireLogin(cycleMutations, 'removeCycle');
