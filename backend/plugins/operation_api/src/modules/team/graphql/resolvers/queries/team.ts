import { ITeamFilter } from '@/team/@types/team';
import { getTeamEstimateChoises } from '@/team/utils';
import { requireLogin } from 'erxes-api-shared/core-modules';
import { Types } from 'mongoose';
import { IContext } from '~/connectionResolvers';

export const teamQueries = {
  getTeam: async (_parent: undefined, { _id }, { models }: IContext) => {
    return models.Team.getTeam(_id);
  },

  getMyTeams: async (
    _parent: undefined,
    _params: undefined,
    { models, user }: IContext,
  ) => {
    const userId = user._id;
    const teamIds = await models.TeamMember.find({ memberId: userId }).distinct(
      'teamId',
    );

    return models.Team.find({ _id: { $in: teamIds } });
  },

  getTeams: async (
    _parent: undefined,
    params: ITeamFilter,
    { models }: IContext,
  ) => {
    if (params.teamIds && params.teamIds.length > 0) {
      return models.Team.find({ _id: { $in: params.teamIds } });
    }

    if (params.projectId) {
      const teamIds = await models.Project.findOne({
        _id: params.projectId,
      }).distinct('teamIds');
      return models.Team.find({ _id: { $in: teamIds } });
    }

    if (params.userId) {
      const teamIds = await models.TeamMember.find({
        memberId: params.userId,
      }).distinct('teamId');

      return models.Team.find({ _id: { $in: teamIds } });
    }

    return models.Team.getTeams(params);
  },

  getTeamMembers: async (
    _parent: undefined,
    { teamId, teamIds }: { teamId: string; teamIds: string[] },
    { models }: IContext,
  ) => {
    const filter: any = {};

    if (teamIds && teamIds?.length) {
      filter.teamId = { $in: teamIds.map((id) => new Types.ObjectId(id)) };

      return models.TeamMember.aggregate([
        { $match: filter },
        { $sort: { _id: -1 } },
        { $group: { _id: '$memberId', doc: { $first: '$$ROOT' } } },
        { $replaceRoot: { newRoot: '$doc' } },
      ]);
    }

    return models.TeamMember.find({ teamId }).sort({ role: 1 });
  },

  getTeamEstimateChoises: async (
    _parent: undefined,
    { teamId }: { teamId: string },
    { models }: IContext,
  ) => {
    const team = await models.Team.getTeam(teamId);

    return getTeamEstimateChoises(team.estimateType);
  },
};

requireLogin(teamQueries, 'getTeam');
requireLogin(teamQueries, 'getMyTeams');
requireLogin(teamQueries, 'getTeams');
requireLogin(teamQueries, 'getTeamMembers');
requireLogin(teamQueries, 'getTeamEstimateChoises');
