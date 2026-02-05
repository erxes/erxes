import { ITicketFilter } from '@/ticket/@types/ticket';
import { generateFilter } from '@/ticket/utils';
import { IOffsetPaginateParams } from 'erxes-api-shared/core-types';
import { defaultPaginate, markResolvers } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

export const cpTicketQueries = {
  cpGetTickets: async (
    _root: undefined,
    { filter }: { filter: ITicketFilter & IOffsetPaginateParams },
    { models }: IContext,
  ) => {
    const { page, perPage, ...params } = filter || {};

    const query = generateFilter(params);

    return defaultPaginate(models.Ticket.find(query), { page, perPage });
  },
};

markResolvers(cpTicketQueries, {
  wrapperConfig: {
    forClientPortal: true,
    cpUserRequired: true,
  },
});
