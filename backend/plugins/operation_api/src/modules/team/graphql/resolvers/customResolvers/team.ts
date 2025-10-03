import { ITeamDocument } from '@/team/@types/team';
import { IContext } from '~/connectionResolvers';

export const Team = {
  taskCount: async (
    team: ITeamDocument,
    _params: undefined,
    { models }: IContext,
  ) => {
    return models.Task.countDocuments({ teamId: team._id });
  },

  memberCount: async (
    team: ITeamDocument,
    _params: undefined,
    { models }: IContext,
  ) => {
    return models.TeamMember.countDocuments({ teamId: team._id });
  },
};
