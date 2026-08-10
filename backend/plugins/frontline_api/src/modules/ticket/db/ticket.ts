import { Schema, Document, FilterQuery, FlattenMaps, Model } from 'mongoose';
import { mongooseStringRandomId, sendTRPCMessage } from 'erxes-api-shared/utils';
import { attachmentSchema } from 'erxes-api-shared/core-modules';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import {
  ITicket,
  ITicketDocument,
  ITicketFilter,
  ITicketUpdate,
} from '@/ticket/@types/ticket';
import { createActivity } from '@/ticket/utils/ticket';
import { createNotifications } from '~/utils/notifications';
import { createPermissionValidator } from '@/ticket/utils/permissionValidator';
import {
  applyNameConfig,
  generateTicketNumber,
  updatePipelineLastNum,
} from '@/ticket/utils/nameAndNumber';

// ─── Schema ───────────────────────────────────────────────────────────────────

const ticketSchema = new Schema(
  {
    _id:               mongooseStringRandomId,
    name:              { type: String },
    channelId:         { type: String },
    stageId:           { type: String },
    pipelineId:        { type: String, label: 'pipelineId' },
    statusId:          { type: String, label: 'statusId' },
    state:             { type: String, label: 'state' },
    description:       { type: String, label: 'Description' },
    type: {
      type: String,
      enum: ['bug', 'ticket', 'feature', 'question', 'incident'],
      default: 'ticket',
    },
    priority:          { type: Number, label: 'Priority', default: 0 },
    assigneeId:        { type: String, label: 'Assignee' },
    createdBy:         { type: String, label: 'Created By' },
    attachments:       { type: [attachmentSchema], label: 'Attachments' },
    labelIds:          { type: [String], label: 'Label IDs' },
    tagIds:            { type: [String], label: 'Tag IDs' },
    userId:            { type: String, label: 'userId' },
    statusChangedDate: { type: Date, label: 'Completed Date', default: Date.now },
    startDate:         { type: Date, label: 'Start Date' },
    targetDate:        { type: Date, label: 'Target Date' },
    number:            { type: String, label: 'Number' },
    statusType:        { type: Number, label: 'Status Type', default: 0 },
    subscribedUserIds: { type: [String], label: 'subscribed user IDs' },
    propertiesData:    { type: Schema.Types.Mixed, optional: true, label: 'Properties data' },
    companyIds:        { type: [String], label: 'Company IDs' },
    customerFieldData: { type: Schema.Types.Mixed, optional: true, label: 'Customer field data' },
  },
  { timestamps: true },
);

// ─── Model ────────────────────────────────────────────────────────────────────

export interface ITicketModel extends Model<ITicketDocument> {
  getTicket(_id: string): Promise<ITicketDocument>;
  getTickets(params: ITicketFilter): Promise<FlattenMaps<ITicketDocument>[] | Document[]>;
  addTicket(doc: ITicket, userId: string, subdomain: string, user?: IUserDocument): Promise<ITicketDocument>;
  updateTicket(args: {
    doc: ITicketUpdate;
    userId: string;
    subdomain: string;
    user?: IUserDocument;
  }): Promise<ITicketDocument>;
  removeTicket(_ids: string[]): Promise<{ ok: number }>;
}

export const loadTicketClass = (models: IModels) => {
  class Ticket {

    // ─── Queries ─────────────────────────────────────────────────────────────

    public static async getTicket(_id: string): Promise<ITicketDocument> {
      const ticket = await models.Ticket.findOne({ _id });
      if (!ticket) throw new Error('Ticket not found');
      return ticket;
    }

    public static async getTickets(
      params: ITicketFilter,
    ): Promise<FlattenMaps<ITicketDocument>[] | Document[]> {
      const query = {} as FilterQuery<ITicketDocument>;

      if (params.name)       query.name       = { $regex: params.name, $options: 'i' };
      if (params.assigneeId) query.assigneeId = params.assigneeId;
      if (params.channelId)  query.channelId  = params.channelId;
      if (params.pipelineId) query.pipelineId = params.pipelineId;
      if (params.statusId)   query.statusId   = params.statusId;
      if (params.priority !== undefined) query.priority = params.priority;
      if (params.labelIds?.length) query.labelIds = { $in: params.labelIds };
      if (params.tagIds?.length)   query.tagIds   = { $in: params.tagIds };
      if (params.startDate)  query.startDate  = { $gte: params.startDate };
      if (params.targetDate) query.targetDate = { $lte: params.targetDate };
      if (params.createdAt)  query.createdAt  = { $gte: params.createdAt };

      switch (params.state) {
        case 'archived': query.state = 'archived'; break;
        case 'deleted':  query.state = 'deleted';  break;
        default: query.$or = [{ state: 'active' }, { state: { $exists: false } }]; break;
      }

      return models.Ticket.find(query).sort({ createdAt: -1 }).lean();
    }

    // ─── Create ──────────────────────────────────────────────────────────────

    public static async addTicket(
      doc: ITicket,
      userId: string,
      subdomain: string,
      user?: IUserDocument,
    ): Promise<ITicketDocument> {
      if (!doc.statusId) throw new Error('Status ID is required');

      const status = await models.Status.getStatus(doc.statusId);
      if (status?.pipelineId) doc.pipelineId = status.pipelineId;

      doc.createdBy = userId;

      const pipeline = doc.pipelineId
        ? await models.Pipeline.findOne({ _id: doc.pipelineId }).lean()
        : null;

      let ticketNumber: string | undefined;
      if (pipeline?.numberSize && pipeline.numberConfig !== undefined) {
        ticketNumber = await generateTicketNumber(models, pipeline as any);
      }

      const ticket = await models.Ticket.create({
        ...doc,
        subscribedUserIds: [userId],
        number: ticketNumber ?? new Date().getTime().toString(),
      });

      if (ticketNumber && pipeline?.numberConfig !== undefined) {
        await updatePipelineLastNum(models, pipeline.numberConfig, ticketNumber);
      }

      if (pipeline?.nameConfig) {
        const customerIds: string[] = doc.customerFieldData?.customerIds || [];
        const companyIds: string[]  = doc.companyIds || [];
        const resolvedName = await applyNameConfig(
          subdomain,
          pipeline.nameConfig,
          customerIds,
          companyIds,
          user,
        );
        if (resolvedName && resolvedName !== pipeline.nameConfig) {
          await models.Ticket.updateOne({ _id: ticket._id }, { $set: { name: resolvedName } });
          ticket.name = resolvedName;
        }
      }

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

    // ─── Update ──────────────────────────────────────────────────────────────

    public static async updateTicket({
      doc,
      userId,
      subdomain,
      user,
    }: {
      doc: ITicketUpdate;
      userId: string;
      subdomain: string;
      user?: IUserDocument;
    }): Promise<ITicketDocument> {
      const { _id, ...rest } = doc;

      const ticket = await models.Ticket.findOne({ _id });
      if (!ticket) throw new Error('Ticket not found');

      const permissionValidator = createPermissionValidator(models);

      if (user) {
        await permissionValidator.validateEditPermission(
          ticket.statusId || '',
          doc.statusId || '',
          user._id,
        );
      }

      if (doc.propertiesData) {
        doc.propertiesData = await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'mutation',
          module: 'fields',
          action: 'validateFieldValues',
          input: { data: doc.propertiesData },
          defaultValue: doc.propertiesData,
        });
      }

      if (doc.statusId && doc.statusId !== ticket.statusId) {
        const status = await models.Status.getStatus(doc.statusId);
        rest.statusChangedDate = new Date();
        rest.statusType = status.type;
      }

      if (doc.pipelineId && doc.pipelineId !== ticket.pipelineId) {
        if (!ticket.statusId) {
          throw new Error('Ticket statusId is required for pipeline migration');
        }

        if (user) {
          await permissionValidator.validatePipelineAccess(doc.pipelineId, user);
        }

        const currentStatus = await models.Status.getStatus(ticket.statusId);
        const matchingStatus = await models.Status.findOne({
          pipelineId: doc.pipelineId,
          type: currentStatus.type,
        });

        if (!matchingStatus) {
          throw new Error(`No matching status in new pipeline for type ${currentStatus.type}`);
        }

        await models.Activity.deleteMany({ contentId: ticket._id, module: 'STATUS' });

        rest.statusId = matchingStatus._id;

        const newPipeline = await models.Pipeline.findOne({ _id: doc.pipelineId }).lean();
        if (newPipeline?.numberSize && newPipeline.numberConfig !== undefined) {
          const newNumber = await generateTicketNumber(models, newPipeline as any);
          if (newNumber) {
            rest.number = newNumber;
            await updatePipelineLastNum(models, newPipeline.numberConfig, newNumber);
          }
        } else {
          rest.number = new Date().getTime().toString();
        }
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

      const update: any = { $set: rest };
      if (doc.isSubscribed !== false) {
        update.$addToSet = { subscribedUserIds: userId };
      } else {
        update.$pull = { subscribedUserIds: userId };
      }

      const updated = await models.Ticket.findOneAndUpdate({ _id }, update, { new: true });
      if (!updated) throw new Error('Ticket not found after update');

      if (updated.subscribedUserIds?.length) {
        const notifyIds = updated.subscribedUserIds.filter(
          (id) => id !== userId && id !== doc.assigneeId,
        );
        if (notifyIds.length) {
          await createNotifications({
            contentType: 'ticket',
            contentTypeId: updated._id,
            fromUserId: userId,
            subdomain,
            notificationType: 'updateTicket',
            userIds: notifyIds,
            action: 'updated',
          });
        }
      }

      return updated;
    }

    // ─── Delete ──────────────────────────────────────────────────────────────

    public static async removeTicket(_ids: string[]): Promise<{ ok: number }> {
      const result = await models.Ticket.deleteMany({ _id: { $in: _ids } });
      return { ok: result.deletedCount || 0 };
    }
  }

  ticketSchema.loadClass(Ticket);
  return ticketSchema;
};
