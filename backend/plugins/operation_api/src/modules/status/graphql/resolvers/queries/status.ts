import { IContext } from '~/connectionResolvers';
import { IStatusFilter } from '@/status/@types/status';
import { STATUS_TYPES } from '@/status/constants/types';

export const statusQueries = {
  getStatus: async (_parent: undefined, { _id }, { models }: IContext) => {
    return models.Status.getStatus(_id);
  },

  getStatusesChoicesByTeam: async (
    _parent: undefined,
    { teamId }: IStatusFilter,
    { models }: IContext,
  ) => {
    const statuses = await Promise.all(
      Object.values(STATUS_TYPES).map((type) =>
        models.Status.getStatuses(teamId, type),
      ),
    );

    return statuses
      .flat() // flatten nested arrays into one array
      .map(({ name, _id, color, type }) => ({
        label: name,
        value: _id,
        color,
        type,
      }));
  },

  getStatusesByType: async (
    _parent: undefined,
    { teamId, type }: IStatusFilter,
    { models }: IContext,
  ) => {
    return models.Status.getStatuses(teamId, type);
  },
};
