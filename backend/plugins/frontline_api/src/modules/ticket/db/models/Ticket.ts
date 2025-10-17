import {
  ITicketDocument,
  ITicket,
  ITicketFilter,
  ITicketUpdate,
} from '~/modules/ticket/@types/ticket';
import { ticketSchema } from '@/ticket/db/definitions/ticket';
import { FilterQuery, FlattenMaps, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface ITicketModel extends Model<ITicketDocument> {
  getTicket(_id: string): Promise<ITicketDocument>;
  getTickets(
    params: ITicketFilter,
  ): Promise<FlattenMaps<ITicketDocument>[] | Document[]>;
  addTicket(doc: ITicket): Promise<ITicketDocument>;

  updateTicket({
    doc,
    userId,
    subdomain,
  }: {
    doc: ITicketUpdate;
    userId: string;
    subdomain: string;
  }): Promise<ITicketDocument>;
  removeTicket(_id: string): Promise<{ ok: number }>;
}

export const loadTicketClass = (models: IModels) => {
  class Ticket {
    public static async getTicket(_id: string): Promise<ITicketDocument> {
      const ticket = await models.Ticket.findOne({ _id });
      if (!ticket) throw new Error('Ticket not found');
      return ticket;
    }

    public static async getTickets(
      params: ITicketFilter,
    ): Promise<FlattenMaps<ITicketDocument>[] | Document[]> {
      const query = {} as FilterQuery<ITicketDocument>;

      if (params.name) query.name = { $regex: params.name, $options: 'i' };
      if (params.channelId) query.channelId = params.channelId;
      if (params.pipelineId) query.pipelineId = params.pipelineId;
      if (params.statusId) query.statusId = params.statusId;
      if (params.assigneeId) query.assigneeId = params.assigneeId;
      if (params.priority) query.priority = params.priority;
      if (params.labelIds) query.labelIds = { $in: params.labelIds };
      if (params.tagIds) query.tagIds = { $in: params.tagIds };
      if (params.createdBy) query.createdBy = params.createdBy;
      if (params.startDate) query.startDate = { $gte: params.startDate };
      if (params.targetDate) query.targetDate = { $lte: params.targetDate };
      if (params.createdAt) query.createdAt = { $gte: params.createdAt };

      return models.Ticket.find(query)
        .populate('pipelineId')
        .populate('statusId')
        .populate('assigneeId', 'name email')
        .sort({ createdAt: -1 })
        .lean();
    }

    public static async addTicket(doc: ITicket): Promise<ITicketDocument> {
      return models.Ticket.create(doc);
    }

    public static async updateTicket(
      _id: string,
      doc: ITicket,
    ): Promise<ITicketDocument | null> {
      return models.Ticket.findOneAndUpdate(
        { _id },
        { $set: { ...doc } },
        { new: true },
      );
    }

    public static async removeTicket(_id: string): Promise<{ ok: number }> {
      const result = await models.Ticket.deleteOne({ _id });
      return { ok: result.deletedCount || 0 };
    }
  }

  ticketSchema.loadClass(Ticket);

  return ticketSchema;
};
