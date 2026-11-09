import { findOpenConversationTickets } from '@/ticket/utils/conversationTickets';
import { IModels } from '~/connectionResolvers';

/**
 * A team member answered the customer in a conversation: the customer's open
 * tickets count that as their first response. Tickets keep their customer,
 * not the conversation, so every open ticket of that customer stops its clock.
 * Best effort; a reply is never refused for this.
 */
export const markConversationTicketsResponded = async (
  models: IModels,
  conversationId: string,
  at = new Date(),
) => {
  try {
    const tickets = await findOpenConversationTickets({ models, conversationId });

    if (tickets.length) {
      await models.Ticket.markSlaFirstResponse(
        tickets.map(({ _id }) => _id),
        at,
      );
    }
  } catch (error) {
    console.error(
      `Marking SLA first response for conversation ${conversationId} failed:`,
      error instanceof Error ? error.message : error,
    );
  }
};
