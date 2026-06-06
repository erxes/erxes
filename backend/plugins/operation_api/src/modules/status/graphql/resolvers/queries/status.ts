import { IStatusFilter } from '@/status/@types/status';
import { STATUS_TYPES } from '@/status/constants/types';
import { IContext } from '~/connectionResolvers';

export const statusQueries = {
  getStatus: async (
    _parent: undefined,
    { _id },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('statusRead');

    return models.Status.getStatus(_id);
  },

  getStatusesChoicesByTeam: async (
    _parent: undefined,
    { teamId }: IStatusFilter,
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('statusRead');

    const statuses = await Promise.all(
      Object.values(STATUS_TYPES).map((type) =>
        models.Status.getStatuses(teamId, type),
      ),
    );

    return statuses.flat().map(({ name, _id, color, type }) => ({
      label: name,
      value: _id,
      color,
      type,
    }));
  },

  getStatusesByType: async (
    _parent: undefined,
    { teamId, type }: IStatusFilter,
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('statusRead');

    return models.Status.getStatuses(teamId, type);
  },
};
