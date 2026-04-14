import { ITicketFilter } from '@/ticket/@types/ticket';
import { generateFilter } from '@/ticket/utils';
import { IOffsetPaginateParams } from 'erxes-api-shared/core-types';
import { defaultPaginate, markResolvers } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

export const cpTicketQueries = {
  cpGetTickets: async (
    _root: undefined,
    { filter }: { filter: ITicketFilter & IOffsetPaginateParams },
    { models, user }: IContext,
  ) => {
    const { page, perPage, createdBy } = filter || {};

    const query = await generateFilter(filter, user, models);

    if (createdBy) {
      query.createdBy = `cp:${createdBy}`;
    }

    return defaultPaginate(models.Ticket.find(query), { page, perPage });
  },

  cpGetTicket: async (
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.Ticket.getTicket(_id);
  },
  cpGetTicketTotalCount: async (
    _root: undefined,
    { filter }: { filter: ITicketFilter & IOffsetPaginateParams },
    { models, user }: IContext,
  ) => {
    const { createdBy } = filter || {};

    const query = await generateFilter(filter, user, models);

    if (createdBy) {
      query.createdBy = `cp:${createdBy}`;
    }

    return models.Ticket.countDocuments(query);
  },
};

markResolvers(cpTicketQueries, {
  wrapperConfig: {
    forClientPortal: true,
    cpUserRequired: true,
  },
});
