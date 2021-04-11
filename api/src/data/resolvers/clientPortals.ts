import { TicketComments } from '../../db/models';
import { ITicketDocument } from '../../db/models/definitions/tickets';

export default {
  async comments(ticket: ITicketDocument) {
    return TicketComments.find({ ticketId: ticket._id });
  }
};
