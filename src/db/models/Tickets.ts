import { Model, model } from 'mongoose';
import { ActivityLogs } from '.';
import { changeCompany, changeCustomer, updateOrder, watchItem } from './boardUtils';
import { IOrderInput } from './definitions/boards';
import { ITicket, ITicketDocument, ticketSchema } from './definitions/tickets';

export interface ITicketModel extends Model<ITicketDocument> {
  createTicket(doc: ITicket): Promise<ITicketDocument>;
  getTicket(_id: string): Promise<ITicketDocument>;
  updateTicket(_id: string, doc: ITicket): Promise<ITicketDocument>;
  updateOrder(stageId: string, orders: IOrderInput[]): Promise<ITicketDocument[]>;
  watchTicket(_id: string, isAdd: boolean, userId: string): void;
  changeCustomer(newCustomerId: string, oldCustomerIds: string[]): Promise<ITicketDocument>;
  changeCompany(newCompanyId: string, oldCompanyIds: string[]): Promise<ITicketDocument>;
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
      const ticketsCount = await Tickets.find({
        stageId: doc.stageId,
      }).countDocuments();

      const ticket = await Tickets.create({
        ...doc,
        order: ticketsCount,
        modifiedAt: new Date(),
      });

      // create log
      await ActivityLogs.createTicketLog(ticket);

      return ticket;
    }

    /**
     * Update Ticket
     */
    public static async updateTicket(_id: string, doc: ITicket) {
      await Tickets.updateOne({ _id }, { $set: doc });

      return Tickets.findOne({ _id });
    }

    /*
     * Update given tickets orders
     */
    public static async updateOrder(stageId: string, orders: IOrderInput[]) {
      return updateOrder(Tickets, orders, stageId);
    }

    /**
     * Watch ticket
     */
    public static async watchTicket(_id: string, isAdd: boolean, userId: string) {
      return watchItem(Tickets, _id, isAdd, userId);
    }

    /**
     * Change customer
     */
    public static async changeCustomer(newCustomerId: string, oldCustomerIds: string[]) {
      return changeCustomer(Tickets, newCustomerId, oldCustomerIds);
    }

    /**
     * Change company
     */
    public static async changeCompany(newCompanyId: string, oldCompanyIds: string[]) {
      return changeCompany(Tickets, newCompanyId, oldCompanyIds);
    }
  }

  ticketSchema.loadClass(Ticket);

  return ticketSchema;
};

loadTicketClass();

// tslint:disable-next-line
const Tickets = model<ITicketDocument, ITicketModel>('tickets', ticketSchema);

export default Tickets;
