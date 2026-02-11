import { ITicketDocument, ITicketFilter } from '@/ticket/@types/ticket';
import { generateFilter } from '@/ticket/utils';
import { requireLogin } from 'erxes-api-shared/core-modules';
import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';

export const ticketQueries = {
  getTicket: async (_parent: undefined, { _id }, { models }: IContext) => {
    return models.Ticket.getTicket(_id);
  },

  getTickets: async (
    _parent: undefined,
    { filter }: { filter: ITicketFilter & ICursorPaginateParams },
    { models }: IContext,
  ) => {
    const filterQuery: FilterQuery<ITicketDocument> = generateFilter(filter);

    return await cursorPaginate<ITicketDocument>({
      model: models.Ticket,
      params: {
        ...filter,
        orderBy: {
          statusId: 'asc',
          createdAt: 'asc',
        },
      },
      query: filterQuery,
    });
  },
};

requireLogin(ticketQueries, 'getTicket');
requireLogin(ticketQueries, 'getTickets');
