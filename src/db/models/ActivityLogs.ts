import { Model, model } from 'mongoose';
import { activityLogSchema, IActionPerformer, IActivity, IActivityLogDocument, ICoc } from './definitions/activityLogs';
import { ICompanyDocument } from './definitions/companies';
import { ACTIVITY_ACTIONS, ACTIVITY_PERFORMER_TYPES, ACTIVITY_TYPES, COC_CONTENT_TYPES } from './definitions/constants';
import { IConversationDocument } from './definitions/conversations';
import { ICustomerDocument } from './definitions/customers';
import { IDealDocument } from './definitions/deals';
import { IInternalNoteDocument } from './definitions/internalNotes';
import { ISegmentDocument } from './definitions/segments';
import { IUserDocument } from './definitions/users';

interface ICreateDocInput {
  performer?: IActionPerformer;
  performedBy?: IActionPerformer;
  activity: IActivity;
  coc: ICoc;
}

interface IActivityLogModel extends Model<IActivityLogDocument> {
  createDoc(doc: ICreateDocInput): Promise<IActivityLogDocument>;

  createInternalNoteLog(internalNote: IInternalNoteDocument, user: IUserDocument): Promise<IActivityLogDocument>;

  cocFindOne(conversationId: string, cocId: string, cocType: string): Promise<IActivityLogDocument>;

  cocCreate(conversationId: string, content: string, cocId: string, cocType: string): Promise<IActivityLogDocument>;

  createConversationLog(
    conversation: IConversationDocument,
    customer?: ICustomerDocument,
  ): Promise<IActivityLogDocument>;

  createSegmentLog(segment: ISegmentDocument, customer?: ICustomerDocument): Promise<IActivityLogDocument>;

  createCustomerRegistrationLog(customer: ICustomerDocument, user?: IUserDocument): Promise<IActivityLogDocument>;

  createCompanyRegistrationLog(company: ICompanyDocument, user?: IUserDocument): Promise<IActivityLogDocument>;

  createDealRegistrationLog(deal: IDealDocument, user?: IUserDocument): Promise<IActivityLogDocument>;

  changeCustomer(newCustomerId: string, customerIds: string[]): Promise<IActivityLogDocument[]>;

  removeCustomerActivityLog(customerId: string): void;

  removeCompanyActivityLog(companyId: string): void;

  changeCompany(newCompanyId: string, companyIds: string[]): Promise<IActivityLogDocument[]>;
}

class ActivityLog {
  /**
   * Create an ActivityLog document
   */
  public static createDoc(doc: ICreateDocInput) {
    const { performer } = doc;

    let performedBy = {
      type: ACTIVITY_PERFORMER_TYPES.SYSTEM,
    };

    if (performer) {
      performedBy = performer;
    }

    return ActivityLogs.create({ performedBy, ...doc });
  }

  /**
   * Create activity log for internal note
   */
  public static createInternalNoteLog(internalNote: IInternalNoteDocument, user: IUserDocument) {
    return this.createDoc({
      activity: {
        type: ACTIVITY_TYPES.INTERNAL_NOTE,
        action: ACTIVITY_ACTIONS.CREATE,
        id: internalNote._id,
        content: internalNote.content,
      },
      performer: {
        type: ACTIVITY_PERFORMER_TYPES.USER,
        id: user._id,
      },
      coc: {
        type: internalNote.contentType,
        id: internalNote.contentTypeId,
      },
    });
  }

  public static cocFindOne(conversationId: string, cocId: string, cocType: string) {
    return ActivityLogs.findOne({
      'activity.type': ACTIVITY_TYPES.CONVERSATION,
      'activity.action': ACTIVITY_ACTIONS.CREATE,
      'activity.id': conversationId,
      'coc.type': cocType,
      'performedBy.type': ACTIVITY_PERFORMER_TYPES.CUSTOMER,
      'coc.id': cocId,
    });
  }

  public static cocCreate(conversationId: string, content: string, cocId: string, cocType: string) {
    return this.createDoc({
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
      coc: {
        type: cocType,
        id: cocId,
      },
    });
  }

  /**
   * Create a conversation log for a given customer,
   * if the customer is related to companies,
   * then create conversation log with all related companies
   */
  public static async createConversationLog(conversation: IConversationDocument, customer?: ICustomerDocument) {
    if (customer == null || (customer && !customer._id)) {
      throw new Error(`'customer' must be supplied when adding activity log for conversations`);
    }

    if (customer.companyIds && customer.companyIds.length > 0) {
      for (const companyId of customer.companyIds) {
        // check against duplication
        const log = await this.cocFindOne(conversation._id, companyId, COC_CONTENT_TYPES.COMPANY);

        if (!log) {
          await this.cocCreate(conversation._id, conversation.content || '', companyId, COC_CONTENT_TYPES.COMPANY);
        }
      }
    }

    // check against duplication ======
    const foundLog = await this.cocFindOne(conversation._id, customer._id, COC_CONTENT_TYPES.CUSTOMER);

    if (!foundLog) {
      return this.cocCreate(conversation._id, conversation.content || '', customer._id, COC_CONTENT_TYPES.CUSTOMER);
    }
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
      'coc.type': segment.contentType,
      'coc.id': customer._id,
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
      coc: {
        type: segment.contentType,
        id: customer._id,
      },
    });
  }

  /**
   * Creates a customer registration log
   */
  public static createCustomerRegistrationLog(customer: ICustomerDocument, user?: IUserDocument) {
    let performer;

    if (user && user._id) {
      performer = {
        type: ACTIVITY_PERFORMER_TYPES.USER,
        id: user._id,
      };
    }

    const customerFullName = `${customer.firstName || ''} ${customer.lastName || ''}`;

    return this.createDoc({
      activity: {
        type: ACTIVITY_TYPES.CUSTOMER,
        action: ACTIVITY_ACTIONS.CREATE,
        content: customerFullName,
        id: customer._id,
      },
      coc: {
        type: COC_CONTENT_TYPES.CUSTOMER,
        id: customer._id,
      },
      performer,
    });
  }

  /**
   * Creates a customer company registration log
   */
  public static createCompanyRegistrationLog(company: ICompanyDocument, user?: IUserDocument) {
    let performer;

    if (user && user._id) {
      performer = {
        type: ACTIVITY_PERFORMER_TYPES.USER,
        id: user._id,
      };
    }

    return this.createDoc({
      activity: {
        type: ACTIVITY_TYPES.COMPANY,
        action: ACTIVITY_ACTIONS.CREATE,
        content: company.primaryName || '',
        id: company._id,
      },
      coc: {
        type: COC_CONTENT_TYPES.COMPANY,
        id: company._id,
      },
      performer,
    });
  }

  /**
   * Creates a deal company registration log
   */
  public static createDealRegistrationLog(deal: IDealDocument, user?: IUserDocument) {
    let performer;

    if (user && user._id) {
      performer = {
        type: ACTIVITY_PERFORMER_TYPES.USER,
        id: user._id,
      };
    }

    return this.createDoc({
      activity: {
        type: ACTIVITY_TYPES.DEAL,
        action: ACTIVITY_ACTIONS.CREATE,
        content: deal.name || '',
        id: deal._id,
      },
      coc: {
        type: COC_CONTENT_TYPES.DEAL,
        id: deal._id,
      },
      performer,
    });
  }

  /**
   * Transfers customers' activity logs to another customer
   */
  public static async changeCustomer(newCustomerId: string, customerIds: string[]) {
    for (const customerId of customerIds) {
      // Updating every activity log of customer
      await ActivityLogs.updateMany(
        { coc: { id: customerId, type: COC_CONTENT_TYPES.CUSTOMER } },
        {
          $set: { coc: { type: COC_CONTENT_TYPES.CUSTOMER, id: newCustomerId } },
        },
      );
    }

    // Returning updated list of activity logs of new customer
    return ActivityLogs.find({
      coc: { type: COC_CONTENT_TYPES.CUSTOMER, id: newCustomerId },
    });
  }

  /**
   * Removes customer's activity logs
   */
  public static async removeCustomerActivityLog(customerId: string) {
    // Removing every activity log of customer
    return ActivityLogs.remove({
      coc: { type: COC_CONTENT_TYPES.CUSTOMER, id: customerId },
    });
  }

  /**
   * Removes company's activity logs
   */
  public static async removeCompanyActivityLog(companyId: string) {
    // Removing every activity log of company
    return ActivityLogs.remove({
      coc: { type: COC_CONTENT_TYPES.COMPANY, id: companyId },
    });
  }

  /**
   * Transfers companies' activity logs to another company
   */
  public static async changeCompany(newCompanyId: string, companyIds: string[]) {
    for (const companyId of companyIds) {
      // Updating every activity log of company
      await ActivityLogs.updateMany(
        { coc: { id: companyId, type: COC_CONTENT_TYPES.COMPANY } },
        { $set: { coc: { type: COC_CONTENT_TYPES.COMPANY, id: newCompanyId } } },
      );
    }

    // Returning updated list of activity logs of new company
    return ActivityLogs.find({
      coc: { type: COC_CONTENT_TYPES.COMPANY, id: newCompanyId },
    });
  }
}

activityLogSchema.loadClass(ActivityLog);

const ActivityLogs = model<IActivityLogDocument, IActivityLogModel>('activity_logs', activityLogSchema);

export default ActivityLogs;
