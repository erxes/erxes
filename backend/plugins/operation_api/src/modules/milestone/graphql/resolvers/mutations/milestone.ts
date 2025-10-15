import { requireLogin } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';
import { IMilestone } from '~/modules/milestone/types';

export const milestoneMutations = {
  createMilestone: async (
    _root: undefined,
    params: IMilestone,
    { models, user }: IContext,
  ) => {
    return await models.Milestone.createMilestone(params, user);
  },

  updateMilestone: async (
    _root: undefined,
    params: IMilestone & { _id: string },
    { models }: IContext,
  ) => {
    return await models.Milestone.updateMilestone(params._id, params);
  },

  removeMilestone: async (
    _root: undefined,
    params: { _id: string },
    { models, user }: IContext,
  ) => {
    return await models.Milestone.removeMilestone(params._id, user);
  },
};

requireLogin(milestoneMutations, 'createMilestone');
requireLogin(milestoneMutations, 'updateMilestone');
requireLogin(milestoneMutations, 'removeMilestone');
