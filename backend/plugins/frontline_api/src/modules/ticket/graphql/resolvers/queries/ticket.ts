import { ITicketDocument, ITicketFilter } from '@/ticket/@types/ticket';
import { generateFilter } from '@/ticket/utils';
import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import {
  PermissionError,
  createPermissionValidator,
} from '@/ticket/utils/permissionValidator';

export const ticketQueries = {
  getTicket: async (
    _parent: undefined,
    { _id },
    { models, user }: IContext,
  ) => {
    const ticket = await models.Ticket.getTicket(_id);

    const canView = await createPermissionValidator(models).canViewStatus(
      ticket.statusId,
      user?._id || '',
    );

    if (!canView) {
      throw new PermissionError(
        'Access denied: You are not a member of this status',
      );
    }

    return ticket;
  },

  getTickets: async (
    _parent: undefined,
    { filter }: { filter: ITicketFilter & ICursorPaginateParams },
    { models, user }: IContext,
  ) => {
    const query: FilterQuery<ITicketDocument> = await generateFilter(
      filter,
      user,
      models,
    );

    return await cursorPaginate<ITicketDocument>({
      model: models.Ticket,
      params: {
        ...filter,
        orderBy: filter.orderBy ?? { updatedAt: -1 },
      },
      query,
    });
  },
};
