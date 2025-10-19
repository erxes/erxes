import { ITicketUpdate } from '~/modules/ticket/@types/ticket';
import { requireLogin } from 'erxes-api-shared/core-modules';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

export const ticketMutations = {
  createTicket: async (
    _parent: undefined,
    params: ITicketUpdate,
    { models, user }: IContext,
  ) => {
    const ticket = await models.Ticket.addTicket({
      ...params,
      userId: user._id,
    });

    graphqlPubsub.publish(`ticketChanged:${ticket._id}`, {
      ticketChanged: { type: 'create', ticket },
    });
    graphqlPubsub.publish('ticketListChanged', {
      ticketListChanged: { type: 'create', ticket },
    });

    return ticket;
  },

  updateTicket: async (
    _parent: undefined,
    params: ITicketUpdate,
    { models, user, subdomain }: IContext,
  ) => {
    const updatedTicket = await models.Ticket.updateTicket({
      doc: params,
      userId: user._id,
      subdomain,
    });

    graphqlPubsub.publish(`ticketChanged:${updatedTicket._id}`, {
      ticketChanged: { type: 'update', ticket: updatedTicket },
    });
    graphqlPubsub.publish('ticketListChanged', {
      ticketListChanged: { type: 'update', ticket: updatedTicket },
    });

    return updatedTicket;
  },

  removeTicket: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    const ticket = await models.Ticket.getTicket(_id);
    const deletedTicket = await models.Ticket.removeTicket(_id);

    graphqlPubsub.publish(`ticketChanged:${_id}`, {
      ticketChanged: { type: 'delete', ticket },
    });
    graphqlPubsub.publish('ticketListChanged', {
      ticketListChanged: { type: 'delete', ticket },
    });

    return deletedTicket;
  },
};

requireLogin(ticketMutations, 'createTicket');
requireLogin(ticketMutations, 'updateTicket');
requireLogin(ticketMutations, 'removeTicket');
