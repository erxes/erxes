import { IContext } from '~/connectionResolvers';
import { IStatus, IStatusEditInput } from '@/status/@types/status';
import { checkUserRole } from '@/utils';
import { TeamMemberRoles } from '@/team/@types/team';

export const statusMutations = {
  addStatus: async (
    _parent: undefined,
    params: IStatus,
    { models, user }: IContext,
  ) => {
    await checkUserRole({
      models,
      teamId: params.teamId,
      userId: user._id,
      allowedRoles: [TeamMemberRoles.ADMIN, TeamMemberRoles.LEAD],
    });

    return models.Status.addStatus(params);
  },

  updateStatus: async (
    _parent: undefined,
    { _id, ...params }: IStatusEditInput,
    { models, user }: IContext,
  ) => {
    const status = await models.Status.getStatus(_id);

    await checkUserRole({
      models,
      teamId: status.teamId,
      userId: user._id,
      allowedRoles: [TeamMemberRoles.ADMIN, TeamMemberRoles.LEAD],
    });

    return models.Status.updateStatus(_id, params);
  },

  deleteStatus: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models, user }: IContext,
  ) => {
    const status = await models.Status.getStatus(_id);

    await checkUserRole({
      models,
      teamId: status.teamId,
      userId: user._id,
      allowedRoles: [TeamMemberRoles.ADMIN, TeamMemberRoles.LEAD],
    });

    return models.Status.removeStatus(_id);
  },
};
