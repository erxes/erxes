import { Resolver } from 'erxes-api-shared/core-types';
import {
  graphqlPubsub,
  markResolvers,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { ITicketUpdate } from '~/modules/ticket/@types/ticket';

export const cpTicketMutations: Record<string, Resolver> = {
  cpCreateTicket: async (
    _parent: undefined,
    params: ITicketUpdate,
    { models, subdomain, cpUser, clientPortal }: IContext,
  ) => {
    const userId = cpUser.erxesCustomerId || cpUser._id || clientPortal._id;

    const ticket = await models.Ticket.addTicket(
      params,
      `cp:${userId}`,
      subdomain,
    );

    graphqlPubsub.publish(`ticketChanged:${ticket._id}`, {
      ticketChanged: { type: 'create', ticket },
    });

    graphqlPubsub.publish('ticketListChanged', {
      ticketListChanged: { type: 'create', ticket },
    });

    if (ticket && cpUser?.erxesCustomerId) {
      await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'mutation',
        module: 'relation',
        action: 'createRelation',
        input: {
          relation: {
            entities: [
              {
                contentType: 'core:customer',
                contentId: cpUser.erxesCustomerId,
              },
              {
                contentType: 'frontline:ticket',
                contentId: ticket._id,
              },
            ],
          },
        },
      });
    }

    return ticket;
  },
};

markResolvers(cpTicketMutations, {
  wrapperConfig: {
    forClientPortal: true,
    cpUserRequired: true,
  },
});
