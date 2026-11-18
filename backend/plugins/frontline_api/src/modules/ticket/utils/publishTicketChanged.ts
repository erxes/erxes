import { graphqlPubsub } from 'erxes-api-shared/utils';

// Open ticket screens and boards listen on these; a write that skips them
// only shows after a refresh.
export const publishTicketChanged = <T extends { _id: unknown }>(
  ticket: T,
  type: 'update',
) => {
  graphqlPubsub.publish(`ticketChanged:${ticket._id}`, {
    ticketChanged: { type, ticket },
  });
  graphqlPubsub.publish('ticketListChanged', {
    ticketListChanged: { type, ticket },
  });
};
