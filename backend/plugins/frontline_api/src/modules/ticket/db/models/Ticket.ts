import {
  ITicketDocument,
  ITicket,
  ITicketFilter,
  ITicketUpdate,
} from '~/modules/ticket/@types/ticket';
import { ticketSchema } from '@/ticket/db/definitions/ticket';
import { Document, FilterQuery, FlattenMaps, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  createNotifications,
  createActivity,
} from '~/modules/ticket/utils/ticket';

export interface ITicketModel extends Model<ITicketDocument> {
  getTicket(_id: string): Promise<ITicketDocument>;
  getTickets(
    params: ITicketFilter,
  ): Promise<FlattenMaps<ITicketDocument>[] | Document[]>;
  addTicket(
    doc: ITicket,
    userId: string,
    subdomain: string,
  ): Promise<ITicketDocument>;
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
      if (params.assigneeId) query.assigneeId = params.assigneeId;
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
      console.log(query, 'assdsda');
      return models.Ticket.find(query)
        .populate('pipelineId')
        .populate('statusId')
        .populate('assigneeId', 'name email')
        .sort({ createdAt: -1 })
        .lean();
    }

    public static async addTicket(
      doc: ITicket,
      userId: string,
      subdomain: string,
    ): Promise<ITicketDocument> {
      if (!doc.statusId) {
        throw new Error('Status ID not found');
      }

      const [result] = await models.Ticket.aggregate([
        { $match: { statusId: doc.statusId } },
        { $group: { _id: null, maxNumber: { $max: '$number' } } },
      ]);

      const nextNumber = (result?.maxNumber || 0) + 1;
      const status = await models.Status.getStatus(doc.statusId);

      if (status && status.pipelineId) {
        doc.pipelineId = status.pipelineId;
      }

      doc.createdBy = userId;

      const ticket = await models.Ticket.create({
        ...doc,
        number: nextNumber,
      });
      if (doc.assigneeId && doc.assigneeId !== userId) {
        await createNotifications({
          contentType: 'ticket',
          contentTypeId: ticket._id,
          fromUserId: userId,
          subdomain,
          notificationType: 'ticketAssignee',
          userIds: [doc.assigneeId],
          action: 'assignee',
        });
      }

      return ticket;
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
        throw new Error('Ticket not found');
      }

      if (doc.statusId && doc.statusId !== ticket.statusId) {
        rest.statusChangedDate = new Date();
        const status = await models.Status.getStatus(doc.statusId || '');
        rest.statusType = status.type;
      }

      if (doc.pipelineId && doc.pipelineId !== ticket.pipelineId) {
        if (!ticket.statusId) {
          throw new Error('Ticket statusId is required for pipeline migration');
        }
        const [result] = await models.Ticket.aggregate([
          { $match: { pipelineId: doc.pipelineId } },
          { $group: { _id: null, maxNumber: { $max: '$number' } } },
        ]);

        const status = await models.Status.getStatus(ticket.statusId || '');
        const newStatus = await models.Status.findOne({
          pipelineId: doc.pipelineId,
          type: status.type,
        });

        if (!newStatus) {
          throw new Error(
            `No matching status found in new pipeline for type ${status.type}`,
          );
        }
        await models.Activity.deleteMany({
          contentId: ticket._id,
          module: 'STATUS',
        });

        const nextNumber = (result?.maxNumber || 0) + 1;

        rest.number = nextNumber;
        rest.statusId = newStatus?._id;
      }

      await createActivity({
        contentType: 'ticket',
        oldDoc: ticket,
        newDoc: { ...ticket.toObject(), ...rest },
        subdomain,
        userId,
        contentId: ticket._id,
      });

      if (doc.assigneeId && doc.assigneeId !== userId) {
        await createNotifications({
          contentType: 'ticket',
          contentTypeId: ticket._id,
          fromUserId: userId,
          subdomain,
          notificationType: 'note',
          userIds: [doc.assigneeId],
          action: 'assignee',
        });
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
