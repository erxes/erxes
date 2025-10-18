import { IStatusFilter } from '@/ticket/@types/status';
import { TICKET_STATUS_TYPES } from '@/ticket/constants/types';
import { requireLogin } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';

export const statusQueries = {
  getTicketStatus: async (
    _parent: undefined,
    { _id },
    { models }: IContext,
  ) => {
    return models.Status.getStatus(_id);
  },

  getTicketStatusesChoicesChannel: async (
    _parent: undefined,
    { channelId }: IStatusFilter,
    { models }: IContext,
  ) => {
    const statuses = await Promise.all(
      Object.values(TICKET_STATUS_TYPES).map((type) =>
        models.Status.getStatuses(channelId, type),
      ),
    );

    return statuses.flat().map(({ name, _id, color, type }) => ({
      label: name,
      value: _id,
      color,
      type,
    }));
  },

  getTicketStatusesByType: async (
    _parent: undefined,
    { channelId, type }: IStatusFilter,
    { models }: IContext,
  ) => {
    await models.Status.createDefaultStatuses(channelId);

    return models.Status.getStatuses(channelId, type);
  },
};

requireLogin(statusQueries, 'getTicketStatus');
requireLogin(statusQueries, 'getTicketStatusesChoicesChannel');
requireLogin(statusQueries, 'getTicketStatusesByType');
