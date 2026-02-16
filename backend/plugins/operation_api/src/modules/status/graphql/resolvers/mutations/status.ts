import { IStatus, IStatusEditInput } from '@/status/@types/status';
import { requireLogin } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';

export const statusMutations = {
  addStatus: async (
    _parent: undefined,
    params: IStatus,
    { models }: IContext,
  ) => {
    // ** Deprecated
    // await checkUserRole({
    //   models,
    //   teamId: params.teamId,
    //   userId: user._id,
    //   allowedRoles: [TeamMemberRoles.ADMIN, TeamMemberRoles.LEAD],
    // });

    return models.Status.addStatus(params);
  },

  updateStatus: async (
    _parent: undefined,
    { _id, ...params }: IStatusEditInput,
    { models }: IContext,
  ) => {
    // ** Deprecated
    // await checkUserRole({
    //   models,
    //   teamId: status.teamId,
    //   userId: user._id,
    //   allowedRoles: [TeamMemberRoles.ADMIN, TeamMemberRoles.LEAD],
    // });

    return models.Status.updateStatus(_id, params);
  },

  deleteStatus: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    // ** Deprecated
    // await checkUserRole({
    //   models,
    //   teamId: status.teamId,
    //   userId: user._id,
    //   allowedRoles: [TeamMemberRoles.ADMIN, TeamMemberRoles.LEAD],
    // });

    return models.Status.removeStatus(_id);
  },
};

requireLogin(statusMutations, 'addStatus');
requireLogin(statusMutations, 'updateStatus');
requireLogin(statusMutations, 'deleteStatus');
