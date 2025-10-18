import { ITicketDocument, ITicketFilter } from '@/ticket/@types/ticket';
import { requireLogin } from 'erxes-api-shared/core-modules';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';

export const ticketQueries = {
  getTicket: async (_parent: undefined, { _id }, { models }: IContext) => {
    return models.Ticket.getTicket(_id);
  },

  getTickets: async (
    _parent: undefined,
    { filter }: { filter: ITicketFilter },
    { models }: IContext,
  ) => {
    const filterQuery: FilterQuery<ITicketDocument> = {};

    if (filter.name) {
      filterQuery.name = { $regex: filter.name, $options: 'i' };
    }

    if (filter.status) filterQuery.status = filter.status;
    if (filter.statusType !== undefined)
      filterQuery.statusType = filter.statusType;
    if (filter.priority !== undefined) filterQuery.priority = filter.priority;
    filterQuery.startDate = buildDateQuery(filter.startDate);
    filterQuery.targetDate = buildDateQuery(filter.targetDate);
    filterQuery.createdAt = buildDateQuery(filter.createdAt);

    if (filter.createdBy) filterQuery.createdBy = filter.createdBy;
    if (filter.assigneeId) filterQuery.assigneeId = filter.assigneeId;
    if (filter.channelId) filterQuery.channelId = filter.channelId;
    if (filter.pipelineId) filterQuery.pipelineId = filter.pipelineId;
    if (filter.userId && !filter.channelId && !filter.assigneeId) {
      filterQuery.assigneeId = filter.userId;
    }

    return await cursorPaginate<ITicketDocument>({
      model: models.Ticket,
      params: {
        ...filter,
        orderBy: {
          statusType: 'asc',
          createdAt: 'asc',
        },
      },
      query: filterQuery,
    });
  },
};

export const buildDateQuery = (value?: Date | { from?: Date; to?: Date }) => {
  if (!value) return undefined;
  if (value instanceof Date) return { $gte: value };

  const query: any = {};
  if (value.from) query.$gte = value.from;
  if (value.to) query.$lte = value.to;
  return query;
};

requireLogin(ticketQueries, 'getTicket');
requireLogin(ticketQueries, 'getTickets');
