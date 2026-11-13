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
import { escapeRegExp, sendTRPCMessage } from 'erxes-api-shared/utils';
import { createPermissionValidator } from '@/ticket/utils/permissionValidator';
import {
  isClosingStatus,
  notifyTicketOwner,
} from '@/ticket/utils/cpNotifications';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { TTicketSlaClock, TTicketSlaPhase } from '@/ticket/@types/sla';
import {
  computeTicketSla,
  isSlaCheckDue,
  isSlaEqual,
  pendingSlaChecks,
  slaFlagOf,
} from '@/ticket/utils/sla';
import { loadBranchCalendar } from '@/ticket/utils/slaCalendar';
import { scheduleSlaChecks } from '@/ticket/utils/slaQueue';
import { assignTicketNumber } from '@/ticket/utils/nameAndNumber';

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
  removeTicket(_id: string[]): Promise<{ ok: number }>;
  syncSla(_id: string, subdomain: string): Promise<void>;
  markSlaFirstResponse(ids: string[], at?: Date): Promise<void>;
  checkSlaDue(input: {
    _id: string;
    clock: TTicketSlaClock;
    phase: TTicketSlaPhase;
    dueAt: Date;
  }): Promise<boolean>;
}

// What a ticket's SLA is computed from.
const SLA_INPUT_FIELDS = ['priority', 'statusId', 'statusType', 'pipelineId', 'branchId'];

export const loadTicketClass = (
  models: IModels,
  { sendDbEventLog }: EventDispatcherReturn,
) => {
  // A ticket is saved even when its SLA cannot be worked out right now.
  const syncSlaSafely = async (_id: string, subdomain: string) => {
    try {
      await models.Ticket.syncSla(_id, subdomain);
    } catch (error) {
      console.error(
        `Ticket ${_id} SLA sync failed:`,
        error instanceof Error ? error.message : error,
      );
    }
  };

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
      if (params.name)
        query.name = { $regex: escapeRegExp(params.name), $options: 'i' };
      if (params.assigneeId) query.assigneeId = params.assigneeId;
      if (params.channelId) query.channelId = params.channelId;
      if (params.pipelineId) query.pipelineId = params.pipelineId;
      if (params.statusId) query.statusId = params.statusId;
      if (params.assigneeId) query.assigneeId = params.assigneeId;
      if (params.assignedMembers)
        query.assignedMembers = { $in: params.assignedMembers };
      if (params.priority) query.priority = params.priority;
      if (params.labelIds) query.labelIds = { $in: params.labelIds };
      if (params.tagIds) query.tagIds = { $in: params.tagIds };
      if (params.userId) query.userId = params.userId;
      if (params.startDate) query.startDate = { $gte: params.startDate };
      if (params.targetDate) query.targetDate = { $lte: params.targetDate };
      if (params.createdAt) query.createdAt = { $gte: params.createdAt };
      switch (params.state) {
        case 'active':
          query.$or = [{ state: 'active' }, { state: { $exists: false } }];
          break;
        case 'archived':
          query.state = 'archived';
          break;
        case 'deleted':
          query.state = 'deleted';
          break;
        default:
          query.$or = [{ state: 'active' }, { state: { $exists: false } }];
          break;
      }

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

      if (status?.pipelineId) {
        doc.pipelineId = status.pipelineId;
      }

      doc.createdBy = userId;

      const ticket = await models.Ticket.create({
        ...doc,
        subscribedUserIds: [userId],
        number: await assignTicketNumber(models, doc.pipelineId),
      });
      if (doc.assigneeId && doc.assigneeId !== userId) {
        await createNotifications({
          contentType: 'ticket',
          contentTypeId: ticket._id,
          fromUserId: userId,
          subdomain,
          notificationType: 'ticketAssignee',
          event: 'frontline:tickets:ticketAssignee',
          userIds: [doc.assigneeId],
          action: 'assignee',
        });
      }

      sendDbEventLog({
        action: 'create',
        docId: ticket._id,
        currentDocument: ticket.toObject(),
      });

      await syncSlaSafely(ticket._id, subdomain);

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
      const { _id, propertiesData: incomingPropertiesData, ...rest } = doc;
      const permissionValidator = createPermissionValidator(models);

      const ticket = await models.Ticket.findOne({ _id });

      if (!ticket) {
        throw new Error('Ticket not found');
      }

      const editsFields =
        !!incomingPropertiesData ||
        Object.keys(rest).some((field) => field !== 'statusId');

      await permissionValidator.validateEditPermission(
        ticket.statusId || '',
        doc.statusId || '',
        userId,
        editsFields,
      );
      if (incomingPropertiesData) {
        await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'mutation',
          module: 'fields',
          action: 'validateFieldValues',
          input: {
            data: incomingPropertiesData,
          },
          defaultValue: incomingPropertiesData,
        });
      }

      let movedTo: { name: string; type: number } | null = null;

      if (doc.statusId && doc.statusId !== ticket.statusId) {
        const status = await models.Status.getStatus(doc.statusId || '');
        rest.statusType = status.type;
        movedTo = { name: status.name, type: status.type };
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

        rest.number = await assignTicketNumber(models, doc.pipelineId);
        rest.statusId = newStatus?._id;
      }

      rest.updatedBy = userId;
      if (rest.statusId && rest.statusId !== ticket.statusId) {
        rest.statusChangedDate = new Date();
        rest.statusChangedBy = userId;
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
          event: 'frontline:tickets:ticketAssignee',
          userIds: [doc.assigneeId],
          action: 'assignee',
        });
      }
      const update: { $set: Record<string, unknown>; [key: string]: unknown } =
        {
          $set: { ...rest },
        };

      if (incomingPropertiesData) {
        for (const [key, value] of Object.entries(incomingPropertiesData)) {
          update.$set[`propertiesData.${key}`] = value;
        }
      }

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

      if (detail?.subscribedUserIds?.length) {
        const userIds =
          detail.subscribedUserIds.filter(
            (id) => id !== userId && id !== doc.assigneeId,
          ) || [];
        await createNotifications({
          contentType: 'ticket',
          contentTypeId: detail._id,
          fromUserId: userId,
          subdomain,
          notificationType: 'updateTicket',
          event: 'frontline:tickets:ticketUpdated',
          userIds,
          action: 'updated',
        });
      }
      if (detail && movedTo) {
        await notifyTicketOwner(subdomain, {
          ticket,
          eventType: 'ticketStatusChanged',
          title: 'Your ticket was updated',
          message: `${ticket.name || 'Your ticket'} is now ${movedTo.name}.`,
          type: isClosingStatus(movedTo.type) ? 'success' : 'info',
          actorId: userId,
        });
      }

      if (detail) {
        sendDbEventLog?.({
          action: 'update',
          docId: detail._id,
          currentDocument: detail.toObject(),
          prevDocument: ticket.toObject(),
        });
      }

      if (detail && SLA_INPUT_FIELDS.some((field) => field in rest)) {
        await syncSlaSafely(detail._id, subdomain);
      }

      return detail;
    }

    /**
     * Brings a ticket's SLA in line with its pipeline policy, priority, branch
     * hours and status, and arms the warning and breach checks it still needs.
     * Safe to call after any change; it writes only when something moved.
     */
    public static async syncSla(_id: string, subdomain: string) {
      const ticket = await models.Ticket.findOne({ _id });

      if (!ticket) {
        return;
      }

      const pipeline = ticket.pipelineId
        ? await models.Pipeline.findOne(
            { _id: ticket.pipelineId },
            { slaPolicy: 1 },
          ).lean()
        : null;
      const policy = pipeline?.slaPolicy;
      const sla = computeTicketSla({
        policy,
        priority: ticket.priority,
        createdAt: ticket.createdAt || new Date(),
        statusType: ticket.statusType,
        calendar: policy?.enabled
          ? await loadBranchCalendar(subdomain, ticket.branchId)
          : undefined,
        current: ticket.sla,
      });

      if (!isSlaEqual(sla, ticket.sla)) {
        const detail = await models.Ticket.findOneAndUpdate(
          { _id },
          sla ? { $set: { sla } } : { $unset: { sla: 1 } },
          { new: true },
        );

        if (detail) {
          sendDbEventLog({
            action: 'update',
            docId: detail._id,
            currentDocument: detail.toObject(),
            prevDocument: ticket.toObject(),
          });
        }
      }

      await scheduleSlaChecks(
        subdomain,
        _id,
        pendingSlaChecks(sla, policy?.warnBeforeMinutes),
      );
    }

    /** Stops the first-response clock of tickets still waiting for a reply. */
    public static async markSlaFirstResponse(ids: string[], at = new Date()) {
      const tickets = await models.Ticket.find({
        _id: { $in: ids },
        'sla.firstResponseDueAt': { $exists: true },
        'sla.firstRespondedAt': { $exists: false },
      });

      for (const ticket of tickets) {
        const detail = await models.Ticket.findOneAndUpdate(
          { _id: ticket._id, 'sla.firstRespondedAt': { $exists: false } },
          { $set: { 'sla.firstRespondedAt': at } },
          { new: true },
        );

        if (detail) {
          sendDbEventLog({
            action: 'update',
            docId: detail._id,
            currentDocument: detail.toObject(),
            prevDocument: ticket.toObject(),
          });
        }
      }
    }

    /**
     * A scheduled warning or breach: marks it when it still applies, which is
     * the change SLA automation triggers react to. False when it no longer
     * applies (answered, resolved, or the due time moved).
     */
    public static async checkSlaDue({
      _id,
      clock,
      phase,
      dueAt,
    }: {
      _id: string;
      clock: TTicketSlaClock;
      phase: TTicketSlaPhase;
      dueAt: Date;
    }) {
      const ticket = await models.Ticket.findOne({ _id });

      if (!ticket || !isSlaCheckDue(ticket.sla, { clock, phase, dueAt })) {
        return false;
      }

      const flag = `sla.${slaFlagOf(clock, phase)}`;
      const detail = await models.Ticket.findOneAndUpdate(
        { _id, [flag]: { $exists: false } },
        { $set: { [flag]: new Date() } },
        { new: true },
      );

      if (!detail) {
        return false;
      }

      sendDbEventLog({
        action: 'update',
        docId: detail._id,
        currentDocument: detail.toObject(),
        prevDocument: ticket.toObject(),
      });

      return true;
    }

    public static async removeTicket(_ids: string[]): Promise<{ ok: number }> {
      const result = await models.Ticket.deleteMany({
        _id: { $in: _ids },
      });
      for (const _id of _ids) {
        sendDbEventLog?.({
          action: 'delete',
          docId: _id,
        });
      }
      return { ok: result.deletedCount || 0 };
    }
  }

  ticketSchema.loadClass(Ticket);

  return ticketSchema;
};
