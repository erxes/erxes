import {
  ITicketDocument,
  ITicket,
  ITicketFilter,
  ITicketUpdate,
} from '~/modules/ticket/@types/ticket';
import { ticketSchema } from '@/ticket/db/definitions/ticket';
import { Document, FilterQuery, FlattenMaps, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { createActivity } from '~/modules/ticket/utils/ticket';
import { createNotifications } from '~/utils/notifications';

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

      const status = await models.Status.getStatus(doc.statusId);

      if (status && status.pipelineId) {
        doc.pipelineId = status.pipelineId;
      }

      doc.createdBy = userId;

      const ticket = await models.Ticket.create({
        ...doc,
        subscribedUserIds: [userId],
        number: new Date().getTime().toString(),
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

        rest.number = new Date().getTime().toString();
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
          notificationType: 'ticketAssignee',
          userIds: [doc.assigneeId],
          action: 'assignee',
        });
      }
      const update = {
        $set: rest,
      };

      if (doc.isSubscribed !== false) {
        update['$addToSet'] = {
          subscribedUserIds: userId,
        };
      }

      if (doc.isSubscribed === false) {
        update['$pull'] = {
          subscribedUserIds: userId,
        };
      }

      const detail = await models.Ticket.findOneAndUpdate({ _id }, update, {
        new: true,
      });

      if (
        detail &&
        detail.subscribedUserIds &&
        detail.subscribedUserIds.length > 0
      ) {
        const userIds = detail.subscribedUserIds.filter(
          (id) => id !== userId && id !== doc.assigneeId,
        );
        await createNotifications({
          contentType: 'ticket',
          contentTypeId: detail._id,
          fromUserId: userId,
          subdomain,
          notificationType: 'updateTicket',
          userIds,
          action: 'updated',
        });
      }
      return detail;
    }

    public static async removeTicket(_id: string): Promise<{ ok: number }> {
      const result = await models.Ticket.deleteOne({ _id });

      return { ok: result.deletedCount || 0 };
    }
  }

  ticketSchema.loadClass(Ticket);

  return ticketSchema;
};
