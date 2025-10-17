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
    if (filter.startDate) filterQuery.startDate = { $gte: filter.startDate };
    if (filter.targetDate) filterQuery.targetDate = { $gte: filter.targetDate };
    if (filter.createdAt) filterQuery.createdAt = { $gte: filter.createdAt };
    if (filter.createdBy) filterQuery.createdBy = filter.createdBy;
    if (filter.assigneeId) filterQuery.assigneeId = filter.assigneeId;
    if (filter.channelId) filterQuery.channelId = filter.channelId;

    if (filter.userId && !filter.channelId && !filter.assigneeId) {
      filterQuery.assigneeId = filter.userId;
    }

    const { list, totalCount, pageInfo } =
      await cursorPaginate<ITicketDocument>({
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

    return { list, totalCount, pageInfo };
  },
};

requireLogin(ticketQueries, 'getTicket');
requireLogin(ticketQueries, 'getTickets');
