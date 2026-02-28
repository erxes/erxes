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

  getTicketStatusesChoicesPipeline: async (
    _parent: undefined,
    { pipelineId }: IStatusFilter,
    { models }: IContext,
  ) => {
    const statuses = await Promise.all(
      Object.values(TICKET_STATUS_TYPES).map((type) =>
        models.Status.getStatuses(pipelineId, type),
      ),
    );

    return statuses
      .flat()
      .map(
        ({
          name,
          _id,
          color,
          type,
          memberIds,
          canMoveMemberIds,
          canEditMemberIds,
          departmentIds,
          visibilityType,
        }) => ({
          label: name,
          value: _id,
          color,
          type,
          memberIds,
          canMoveMemberIds,
          canEditMemberIds,
          departmentIds,
          visibilityType,
        }),
      );
  },

  getTicketStatusesByType: async (
    _parent: undefined,
    { pipelineId, type }: IStatusFilter,
    { models }: IContext,
  ) => {
    return await models.Status.getStatuses(pipelineId, type);
  },
};

requireLogin(statusQueries, 'getTicketStatus');
requireLogin(statusQueries, 'getTicketStatusesChoicesPipeline');
requireLogin(statusQueries, 'getTicketStatusesByType');
