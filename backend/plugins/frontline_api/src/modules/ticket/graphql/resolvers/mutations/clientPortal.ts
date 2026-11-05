import { Resolver } from 'erxes-api-shared/core-types';
import { graphqlPubsub, markResolvers } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { ITicketUpdate } from '~/modules/ticket/@types/ticket';
import { notifyTicketOwner } from '@/ticket/utils/cpNotifications';

export const cpTicketMutations: Record<string, Resolver> = {
  cpCreateTicket: async (
    _parent: undefined,
    params: ITicketUpdate,
    { models, subdomain, cpUser, clientPortal }: IContext,
  ) => {
    const userId = cpUser?.erxesCustomerId || cpUser?._id || clientPortal?._id;

    // The ticket keeps its customer itself.
    const ticket = await models.Ticket.addTicket(
      userId ? { ...params, customerId: params.customerId || userId } : params,
      `cp:${userId}`,
      subdomain,
    );

    graphqlPubsub.publish(`ticketChanged:${ticket._id}`, {
      ticketChanged: { type: 'create', ticket },
    });

    graphqlPubsub.publish('ticketListChanged', {
      ticketListChanged: { type: 'create', ticket },
    });

    if (ticket && cpUser?._id && cpUser?.clientPortalId) {
      await notifyTicketOwner(subdomain, {
        ticket,
        owner: {
          cpUserId: cpUser._id,
          clientPortalId: cpUser.clientPortalId,
        },
        eventType: 'ticketCreated',
        title: 'We received your ticket',
        message: `${ticket.name || 'Your ticket'} — ticket number #${
          ticket.number
        }. The support team replies here.`,
        type: 'success',
        priority: 'low',
      });
    }

    return ticket;
  },

  cpUpdateTicket: async (
    _parent: undefined,
    params: ITicketUpdate,
    { models, cpUser, clientPortal, subdomain }: IContext,
  ) => {
    const userId = cpUser.erxesCustomerId || cpUser._id || clientPortal._id;

    return await models.Ticket.updateTicket({
      doc: params,
      userId: `cp:${userId}`,
      subdomain,
    });
  },

  cpTicketCreateNote: async (
    _parent: undefined,
    { content, contentId },
    { models, cpUser, clientPortal, subdomain }: IContext,
  ) => {
    const userId = cpUser?.erxesCustomerId || cpUser?._id || clientPortal?._id;

    return models.Note.createNote({
      doc: {
        content,
        contentId,
        isInternal: false,
        createdBy: `cp:${userId}`,
      },
      subdomain,
      userId: `cp:${userId}`,
    });
  },
};

markResolvers(cpTicketMutations, {
  wrapperConfig: {
    forClientPortal: true,
  },
});
