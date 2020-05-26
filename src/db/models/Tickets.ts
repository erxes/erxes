import { Model, model } from 'mongoose';
import { ActivityLogs } from '.';
import { fillSearchTextItem, watchItem } from './boardUtils';
import { BOARD_STATUSES } from './definitions/constants';
import { ITicket, ITicketDocument, ticketSchema } from './definitions/tickets';

export interface ITicketModel extends Model<ITicketDocument> {
  createTicket(doc: ITicket): Promise<ITicketDocument>;
  getTicket(_id: string): Promise<ITicketDocument>;
  updateTicket(_id: string, doc: ITicket): Promise<ITicketDocument>;
  watchTicket(_id: string, isAdd: boolean, userId: string): void;
}

export const loadTicketClass = () => {
  class Ticket {
    /**
     * Retreives Ticket
     */
    public static async getTicket(_id: string) {
      const ticket = await Tickets.findOne({ _id });

      if (!ticket) {
        throw new Error('Ticket not found');
      }

      return ticket;
    }

    /**
     * Create a Ticket
     */
    public static async createTicket(doc: ITicket) {
      if (doc.sourceConversationId) {
        const convertedTicket = await Tickets.findOne({ sourceConversationId: doc.sourceConversationId });

        if (convertedTicket) {
          throw new Error('Already converted a ticket');
        }
      }

      const lastVisibleTickets = await Tickets.find(
        {
          stageId: doc.stageId,
          status: { $ne: BOARD_STATUSES.ARCHIVED },
        },
        { order: 1 },
      )
        .sort({ order: -1 })
        .limit(1);

      const ticket = await Tickets.create({
        ...doc,
        order: ((lastVisibleTickets && lastVisibleTickets.length > 0 ? lastVisibleTickets[0].order : 0) || 0) + 1,
        createdAt: new Date(),
        modifiedAt: new Date(),
        searchText: fillSearchTextItem(doc),
      });

      // create log
      await ActivityLogs.createBoardItemLog({ item: ticket, contentType: 'ticket' });

      return ticket;
    }

    /**
     * Update Ticket
     */
    public static async updateTicket(_id: string, doc: ITicket) {
      const searchText = fillSearchTextItem(doc, await Tickets.getTicket(_id));

      await Tickets.updateOne({ _id }, { $set: doc, searchText });

      return Tickets.findOne({ _id });
    }

    /**
     * Watch ticket
     */
    public static async watchTicket(_id: string, isAdd: boolean, userId: string) {
      return watchItem(Tickets, _id, isAdd, userId);
    }
  }

  ticketSchema.loadClass(Ticket);

  return ticketSchema;
};

loadTicketClass();

// tslint:disable-next-line
const Tickets = model<ITicketDocument, ITicketModel>('tickets', ticketSchema);

export default Tickets;
