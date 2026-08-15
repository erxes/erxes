import { ITeamFilter } from '@/team/@types/team';
import { getTeamEstimateChoises } from '@/team/utils';
import { Types } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { cursorPaginate } from 'erxes-api-shared/utils';

export const teamQueries = {
  getTeam: async (
    _parent: undefined,
    { _id },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('teamRead');

    return models.Team.getTeam(_id);
  },

  getMyTeams: async (
    _parent: undefined,
    _params: undefined,
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('teamRead');

    const userId = user._id;
    const teamIds = await models.TeamMember.find({ memberId: userId }).distinct(
      'teamId',
    );

    return models.Team.find({ _id: { $in: teamIds } });
  },

  getTeams: async (
    _parent: undefined,
    params: ITeamFilter,
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('teamRead');

    if (params.teamIds && params.teamIds.length > 0 && !params.userId) {
      return models.Team.find({ _id: { $in: params.teamIds } });
    }

    if (params.isTriageEnabled) {
      return models.Team.find({
        $or: [{ triageEnabled: true }, { _id: params.teamId }],
      });
    }

    if (params.projectId) {
      const teamIds = await models.Project.findOne({
        _id: params.projectId,
      }).distinct('teamIds');

      if (params.teamId) {
        teamIds.push(params.teamId);
      }

      return models.Team.find({ _id: { $in: teamIds } });
    }

    if (params.userId) {
      const teamIds = await models.TeamMember.find({
        memberId: params.userId,
      }).distinct('teamId');

      if (params.teamId) {
        teamIds.push(params.teamId);
      }

      return models.Team.find({ _id: { $in: teamIds } });
    }

    return models.Team.getTeams(params);
  },

  operationGlobalSearchTeams: async (
    _parent: undefined,
    params: ICursorPaginateParams & { searchValue?: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('teamRead');

    const searchValue = params.searchValue?.trim();
    const escapedSearchValue = searchValue?.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&',
    );

    return cursorPaginate({
      model: models.Team,
      params: {
        ...params,
        orderBy: { name: 1 },
      },
      query: escapedSearchValue
        ? { name: { $regex: escapedSearchValue, $options: 'i' } }
        : {},
    });
  },

  getTeamMembers: async (
    _parent: undefined,
    { teamId, teamIds }: { teamId: string; teamIds: string[] },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('teamRead');

    const filter: any = {};

    if (teamIds?.length) {
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
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('teamRead');

    const team = await models.Team.getTeam(teamId);

    return getTeamEstimateChoises(team.estimateType);
  },
};
