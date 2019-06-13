import { Model, model } from 'mongoose';
import { Customers } from '.';
import { graphqlPubsub } from '../../pubsub';
import {
  activityLogSchema,
  IActionPerformer,
  IActivity,
  IActivityLogDocument,
  IContentType,
} from './definitions/activityLogs';
import { ICompanyDocument } from './definitions/companies';
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_CONTENT_TYPES,
  ACTIVITY_PERFORMER_TYPES,
  ACTIVITY_TYPES,
} from './definitions/constants';
import { IConversationDocument } from './definitions/conversations';
import { ICustomerDocument } from './definitions/customers';
import { IDealDocument } from './definitions/deals';
import { IEmailDeliveriesDocument } from './definitions/emailDeliveries';
import { IInternalNoteDocument } from './definitions/internalNotes';
import { ISegmentDocument } from './definitions/segments';
import { ITaskDocument } from './definitions/tasks';
import { ITicketDocument } from './definitions/tickets';

interface ICreateDocInput {
  performer?: IActionPerformer;
  performedBy?: IActionPerformer;
  activity: IActivity;
  contentType: IContentType;
  // TODO: remove
  coc?: IContentType;
}

export interface IActivityLogModel extends Model<IActivityLogDocument> {
  createDoc(doc: ICreateDocInput): Promise<IActivityLogDocument>;
  createLogFromWidget(type: string, payload): Promise<IActivityLogDocument>;
  createConversationLog(conversation: IConversationDocument): Promise<IActivityLogDocument>;
  createCustomerLog(customer: ICustomerDocument): Promise<IActivityLogDocument>;
  createCompanyLog(company: ICompanyDocument): Promise<IActivityLogDocument>;
  createEmailDeliveryLog(email: IEmailDeliveriesDocument): Promise<IActivityLogDocument>;
  createInternalNoteLog(internalNote: IInternalNoteDocument): Promise<IActivityLogDocument>;
  createDealLog(deal: IDealDocument): Promise<IActivityLogDocument>;
  createSegmentLog(segment: ISegmentDocument, customer?: ICustomerDocument): Promise<IActivityLogDocument>;
  createTicketLog(ticket: ITicketDocument): Promise<IActivityLogDocument>;
  createTaskLog(task: ITaskDocument): Promise<IActivityLogDocument>;
}

export const loadClass = () => {
  const cocFindOne = (conversationId: string, cocId: string, cocType: string) => {
    return ActivityLogs.findOne({
      'activity.type': ACTIVITY_TYPES.CONVERSATION,
      'activity.action': ACTIVITY_ACTIONS.CREATE,
      'activity.id': conversationId,
      'contentType.type': cocType,
      'performedBy.type': ACTIVITY_PERFORMER_TYPES.CUSTOMER,
      'contentType.id': cocId,
    });
  };

  const cocCreate = (conversationId: string, content: string, cocId: string, cocType: string) => {
    return ActivityLogs.createDoc({
      activity: {
        type: ACTIVITY_TYPES.CONVERSATION,
        action: ACTIVITY_ACTIONS.CREATE,
        content,
        id: conversationId,
      },
      performer: {
        type: ACTIVITY_PERFORMER_TYPES.CUSTOMER,
        id: cocId,
      },
      contentType: {
        type: cocType,
        id: cocId,
      },
    });
  };

  class ActivityLog {
    /**
     * Create an ActivityLog document
     */
    public static async createDoc(doc: ICreateDocInput) {
      const { performer } = doc;

      let performedBy = {
        type: ACTIVITY_PERFORMER_TYPES.SYSTEM,
      };

      if (performer) {
        performedBy = performer;
      }

      const log = await ActivityLogs.create({ performedBy, ...doc });

      graphqlPubsub.publish('activityLogsChanged', { activityLogsChanged: true });

      return log;
    }

    public static createLogFromWidget(type: string, payload) {
      switch (type) {
        case 'create-customer':
          ActivityLogs.createCustomerLog(payload);
          break;
        case 'create-company':
          ActivityLogs.createCompanyLog(payload);
          break;
        case 'create-conversation':
          ActivityLogs.createConversationLog(payload);
          break;
      }
    }

    /**
     * Create a conversation log for a given customer,
     * if the customer is related to companies,
     * then create conversation log with all related companies
     */
    public static async createConversationLog(conversation: IConversationDocument) {
      const customer = await Customers.findOne({ _id: conversation.customerId });

      if (!customer || !customer._id) {
        return;
      }

      if (customer.companyIds && customer.companyIds.length > 0) {
        for (const companyId of customer.companyIds) {
          // check against duplication
          const log = await cocFindOne(conversation._id, companyId, ACTIVITY_CONTENT_TYPES.COMPANY);

          if (!log) {
            await cocCreate(conversation._id, conversation.content || '', companyId, ACTIVITY_CONTENT_TYPES.COMPANY);
          }
        }
      }

      // check against duplication ======
      const foundLog = await cocFindOne(conversation._id, customer._id, ACTIVITY_CONTENT_TYPES.CUSTOMER);

      if (!foundLog) {
        return cocCreate(conversation._id, conversation.content || '', customer._id, ACTIVITY_CONTENT_TYPES.CUSTOMER);
      }
    }

    public static createCustomerLog(customer: ICustomerDocument) {
      let performer;

      if (customer.ownerId) {
        performer = {
          type: ACTIVITY_PERFORMER_TYPES.USER,
          id: customer.ownerId,
        };
      }

      let action = ACTIVITY_ACTIONS.CREATE;
      let content = `${customer.firstName || ''} ${customer.lastName || ''}`;

      if (customer.mergedIds && customer.mergedIds.length > 0) {
        action = ACTIVITY_ACTIONS.MERGE;
        content = customer.mergedIds.toString();
      }

      return ActivityLogs.createDoc({
        activity: {
          type: ACTIVITY_TYPES.CUSTOMER,
          action,
          content,
          id: customer._id,
        },
        contentType: {
          type: ACTIVITY_CONTENT_TYPES.CUSTOMER,
          id: customer._id,
        },
        performer,
      });
    }

    public static createCompanyLog(company: ICompanyDocument) {
      let performer;

      if (company.ownerId) {
        performer = {
          type: ACTIVITY_PERFORMER_TYPES.USER,
          id: company.ownerId,
        };
      }

      let action = ACTIVITY_ACTIONS.CREATE;
      let content = company.primaryName || '';

      if (company.mergedIds && company.mergedIds.length > 0) {
        action = ACTIVITY_ACTIONS.MERGE;
        content = company.mergedIds.toString();
      }

      return ActivityLogs.createDoc({
        activity: {
          type: ACTIVITY_TYPES.COMPANY,
          action,
          content,
          id: company._id,
        },
        contentType: {
          type: ACTIVITY_CONTENT_TYPES.COMPANY,
          id: company._id,
        },
        performer,
      });
    }

    public static createEmailDeliveryLog(email: IEmailDeliveriesDocument) {
      return ActivityLogs.createDoc({
        activity: {
          id: Math.random().toString(),
          type: ACTIVITY_TYPES.EMAIL,
          action: ACTIVITY_ACTIONS.SEND,
          content: email.body,
        },
        contentType: {
          type: email.cocType,
          id: email.cocId || '',
        },
        performer: {
          type: ACTIVITY_PERFORMER_TYPES.USER,
          id: email.userId,
        },
      });
    }

    public static createInternalNoteLog(internalNote: IInternalNoteDocument) {
      return ActivityLogs.createDoc({
        activity: {
          type: ACTIVITY_TYPES.INTERNAL_NOTE,
          action: ACTIVITY_ACTIONS.CREATE,
          content: internalNote.content,
          id: internalNote._id,
        },
        contentType: {
          type: internalNote.contentType,
          id: internalNote.contentTypeId,
        },
        performer: {
          type: ACTIVITY_PERFORMER_TYPES.USER,
          id: internalNote.createdUserId,
        },
      });
    }

    public static createDealLog(deal: IDealDocument) {
      let performer;

      if (deal.userId) {
        performer = {
          type: ACTIVITY_PERFORMER_TYPES.USER,
          id: deal.userId,
        };
      }

      return ActivityLogs.createDoc({
        activity: {
          type: ACTIVITY_TYPES.DEAL,
          action: ACTIVITY_ACTIONS.CREATE,
          content: deal.name || '',
          id: deal._id,
        },
        contentType: {
          type: ACTIVITY_CONTENT_TYPES.DEAL,
          id: deal._id,
        },
        performer,
      });
    }

    public static createTicketLog(ticket: ITicketDocument) {
      let performer;

      if (ticket.userId) {
        performer = {
          type: ACTIVITY_PERFORMER_TYPES.USER,
          id: ticket.userId,
        };
      }

      return ActivityLogs.createDoc({
        activity: {
          type: ACTIVITY_TYPES.TICKET,
          action: ACTIVITY_ACTIONS.CREATE,
          content: ticket.name || '',
          id: ticket._id,
        },
        contentType: {
          type: ACTIVITY_CONTENT_TYPES.TICKET,
          id: ticket._id,
        },
        performer,
      });
    }

    public static createTaskLog(task: ITaskDocument) {
      let performer;

      if (task.userId) {
        performer = {
          type: ACTIVITY_PERFORMER_TYPES.USER,
          id: task.userId,
        };
      }

      return ActivityLogs.createDoc({
        activity: {
          type: ACTIVITY_TYPES.TASK,
          action: ACTIVITY_ACTIONS.CREATE,
          content: task.name || '',
          id: task._id,
        },
        contentType: {
          type: ACTIVITY_CONTENT_TYPES.TASK,
          id: task._id,
        },
        performer,
      });
    }

    /**
     * Create a customer or company segment log
     */
    public static async createSegmentLog(segment: ISegmentDocument, customer?: ICustomerDocument) {
      if (!customer) {
        throw new Error('customer must be supplied');
      }

      const foundSegment = await ActivityLogs.findOne({
        'activity.type': ACTIVITY_TYPES.SEGMENT,
        'activity.action': ACTIVITY_ACTIONS.CREATE,
        'activity.id': segment._id,
        'contentType.type': segment.contentType,
        'contentType.id': customer._id,
      });

      if (foundSegment) {
        // since this type of activity log already exists, new one won't be created
        return foundSegment;
      }

      return this.createDoc({
        activity: {
          type: ACTIVITY_TYPES.SEGMENT,
          action: ACTIVITY_ACTIONS.CREATE,
          content: segment.name,
          id: segment._id,
        },
        contentType: {
          type: segment.contentType,
          id: customer._id,
        },
      });
    }
  }

  activityLogSchema.loadClass(ActivityLog);

  return activityLogSchema;
};

loadClass();

// tslint:disable-next-line
const ActivityLogs = model<IActivityLogDocument, IActivityLogModel>('activity_logs', activityLogSchema);

export default ActivityLogs;
