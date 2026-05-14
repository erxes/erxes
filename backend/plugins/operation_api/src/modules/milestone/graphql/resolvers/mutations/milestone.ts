import { IContext } from '~/connectionResolvers';
import { IMilestone } from '~/modules/milestone/types';

export const milestoneMutations = {
  createMilestone: async (
    _root: undefined,
    params: IMilestone,
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('milestoneCreate');

    return models.Milestone.createMilestone(params, user);
  },

  updateMilestone: async (
    _root: undefined,
    params: IMilestone & { _id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('milestoneUpdate');

    return models.Milestone.updateMilestone(params._id, params);
  },

  removeMilestone: async (
    _root: undefined,
    params: { _id: string },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('milestoneRemove');

    return models.Milestone.removeMilestone(params._id, user);
  },
};
