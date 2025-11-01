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
      if (params.userId) query.userId = params.userId;
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
      const status = await models.Status.getStatus(doc.statusId);

      if (status && status.pipelineId) {
        doc.pipelineId = status.pipelineId;
      }

      return models.Ticket.create(doc);
    }

    public static async updateTicket({
      doc,
      userId,
      subdomain,
    }: {
      doc: ITicketUpdate;
      userId: string;
      subdomain: string;
    }) {
      const { _id, ...rest } = doc;

      const ticket = await models.Ticket.findOne({ _id });

      if (!ticket) {
        throw new Error('ticket not found');
      }

      if (doc.status && doc.status !== ticket.status) {
        rest.statusChangedDate = new Date();
        const status = await models.Status.getStatus(doc.status || '');
        rest.statusType = status.type;
      }

      if (doc.pipelineId && doc.pipelineId !== ticket.pipelineId) {
        const [result] = await models.Ticket.aggregate([
          { $match: { pipelineId: doc.pipelineId } },
          { $group: { _id: null, maxNumber: { $max: '$number' } } },
        ]);

        const status = await models.Status.getStatus(ticket.status || '');

        const newStatus = await models.Status.findOne({
          pipelineId: doc.pipelineId,
          type: status.type,
        });

        const nextNumber = (result?.maxNumber || 0) + 1;

        rest.number = nextNumber;
        rest.status = newStatus?._id;
      }

      return models.Ticket.findOneAndUpdate(
        { _id },
        { $set: { ...rest } },
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
