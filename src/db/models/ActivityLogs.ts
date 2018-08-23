import { Model, model } from "mongoose";
import { activityLogSchema, IActivityLog } from "./definitions/activityLogs";
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_PERFORMER_TYPES,
  ACTIVITY_TYPES,
  COC_CONTENT_TYPES
} from "./definitions/constants";

interface ICocInput {
  id: string;
  type: string;
}

interface IActivityInput {
  type: string;
  action: string;
  content: string;
  id: string;
}

interface IActionPerformerInput {
  type: string;
  id: string;
}

interface ICreateDocInput {
  performer?: IActionPerformerInput;
  performedBy?: IActionPerformerInput;
  activity: IActivityInput;
  coc: ICocInput;
}

interface IInternalNoteInput {
  _id: string;
  content: string;
  contentType: string;
  contentTypeId: string;
}

interface IUserInput {
  _id: string;
}

interface IConversationInput {
  _id: string;
  content: string;
}

interface ICustomerInput {
  _id: string;
  companyIds: string[];
  getFullName?: any;
}

interface ISegmentInput {
  _id: string;
  contentType: string;
  name: string;
}

interface ICompanyInput {
  _id: string;
  primaryName: string;
}

interface IDealInput {
  _id: string;
  name: string;
}

interface IActivityLogModel extends Model<IActivityLog> {
  createDoc(doc: any): Promise<IActivityLog>;

  createInternalNoteLog(
    internalNote: IInternalNoteInput,
    user: IUserInput
  ): Promise<IActivityLog>;

  cocFindOne(
    conversationId: string,
    cocId: string,
    cocType: string
  ): Promise<IActivityLog>;

  cocCreate(
    conversationId: string,
    content: string,
    cocId: string,
    cocType: string
  ): Promise<IActivityLog>;

  createConversationLog(
    conversation: IConversationInput,
    customer: ICustomerInput
  ): Promise<IActivityLog>;

  createSegmentLog(
    segment: ISegmentInput,
    customer: ICustomerInput
  ): Promise<IActivityLog>;

  createCustomerRegistrationLog(
    customer: ICustomerInput,
    user: IUserInput
  ): Promise<IActivityLog>;

  createCompanyRegistrationLog(
    company: ICompanyInput,
    user: IUserInput
  ): Promise<IActivityLog>;

  createDealRegistrationLog(
    deal: IDealInput,
    user: IUserInput
  ): Promise<IActivityLog>;

  changeCustomer(
    newCustomerId: string,
    customerIds: string[]
  ): Promise<IActivityLog[]>;

  removeCustomerActivityLog(customerId: string): any;

  removeCompanyActivityLog(companyId: string): any;

  changeCompany(
    newCompanyId: string,
    companyIds: string[]
  ): Promise<IActivityLog[]>;
}

class ActivityLog {
  public static createDoc(doc: ICreateDocInput) {
    const { performer } = doc;

    let performedBy = {
      type: ACTIVITY_PERFORMER_TYPES.SYSTEM
    };

    if (performer) {
      performedBy = performer;
    }

    return ActivityLogs.create({ performedBy, ...doc });
  }

  public static createInternalNoteLog(
    internalNote: IInternalNoteInput,
    user: IUserInput
  ) {
    return this.createDoc({
      activity: {
        type: ACTIVITY_TYPES.INTERNAL_NOTE,
        action: ACTIVITY_ACTIONS.CREATE,
        id: internalNote._id,
        content: internalNote.content
      },
      performer: {
        type: ACTIVITY_PERFORMER_TYPES.USER,
        id: user._id
      },
      coc: {
        type: internalNote.contentType,
        id: internalNote.contentTypeId
      }
    });
  }

  public static cocFindOne(
    conversationId: string,
    cocId: string,
    cocType: string
  ) {
    return ActivityLogs.findOne({
      "activity.type": ACTIVITY_TYPES.CONVERSATION,
      "activity.action": ACTIVITY_ACTIONS.CREATE,
      "activity.id": conversationId,
      "coc.type": cocType,
      "performedBy.type": ACTIVITY_PERFORMER_TYPES.CUSTOMER,
      "coc.id": cocId
    });
  }

  public static cocCreate(
    conversationId: string,
    content: string,
    cocId: string,
    cocType: string
  ) {
    return this.createDoc({
      activity: {
        type: ACTIVITY_TYPES.CONVERSATION,
        action: ACTIVITY_ACTIONS.CREATE,
        content,
        id: conversationId
      },
      performer: {
        type: ACTIVITY_PERFORMER_TYPES.CUSTOMER,
        id: cocId
      },
      coc: {
        type: cocType,
        id: cocId
      }
    });
  }

  /**
   * Create a conversation log for a given customer,
   * if the customer is related to companies,
   * then create conversation log with all related companies
   * @param {Object} conversation - Conversation object
   * @param {string} conversation._id - Conversation document id
   * @param {Object} customer - Customer object
   * @param {string} customer.type - One of COC_CONTENT_TYPES choices
   * @param {string} customer.id - Customer document id
   */
  public static async createConversationLog(
    conversation: IConversationInput,
    customer: ICustomerInput
  ) {
    if (customer == null || (customer && !customer._id)) {
      throw new Error(
        `'customer' must be supplied when adding activity log for conversations`
      );
    }

    if (customer.companyIds && customer.companyIds.length > 0) {
      for (const companyId of customer.companyIds) {
        // check against duplication
        const log = await this.cocFindOne(
          conversation._id,
          companyId,
          COC_CONTENT_TYPES.COMPANY
        );

        if (!log) {
          await this.cocCreate(
            conversation._id,
            conversation.content,
            companyId,
            COC_CONTENT_TYPES.COMPANY
          );
        }
      }
    }

    // check against duplication ======
    const foundLog = await this.cocFindOne(
      conversation._id,
      customer._id,
      COC_CONTENT_TYPES.CUSTOMER
    );

    if (!foundLog) {
      return this.cocCreate(
        conversation._id,
        conversation.content,
        customer._id,
        COC_CONTENT_TYPES.CUSTOMER
      );
    }
  }

  /**
   * Create a customer or company segment log
   * @param {Segment} segment - Segment document
   * @param {COC} customer - Related customer or company
   * @return {Promise} Return Promise resolving created Segment
   */
  public static async createSegmentLog(
    segment: ISegmentInput,
    customer: ICustomerInput
  ) {
    if (!customer) {
      throw new Error("customer must be supplied");
    }

    const foundSegment = await ActivityLogs.findOne({
      "activity.type": ACTIVITY_TYPES.SEGMENT,
      "activity.action": ACTIVITY_ACTIONS.CREATE,
      "activity.id": segment._id,
      "coc.type": segment.contentType,
      "coc.id": customer._id
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
        id: segment._id
      },
      coc: {
        type: segment.contentType,
        id: customer._id
      }
    });
  }

  /**
   * Creates a customer registration log
   * @param {Customer} customer - Customer document
   * @param {user} user - User document
   * @return {Promise} Return Promise resolving created ActivityLog
   */
  public static createCustomerRegistrationLog(
    customer: ICustomerInput,
    user: IUserInput
  ) {
    let performer = null;

    if (user && user._id) {
      performer = {
        type: ACTIVITY_PERFORMER_TYPES.USER,
        id: user._id
      };
    }

    return this.createDoc({
      activity: {
        type: ACTIVITY_TYPES.CUSTOMER,
        action: ACTIVITY_ACTIONS.CREATE,
        content: customer.getFullName(),
        id: customer._id
      },
      coc: {
        type: COC_CONTENT_TYPES.CUSTOMER,
        id: customer._id
      },
      performer
    });
  }

  /**
   * Creates a customer company registration log
   * @param {Company} company - Company document
   * @param {user} user - User document
   * @return {Promise} Return Promise resolving created ActivityLog
   */
  public static createCompanyRegistrationLog(
    company: ICompanyInput,
    user: IUserInput
  ) {
    let performer = null;

    if (user && user._id) {
      performer = {
        type: ACTIVITY_PERFORMER_TYPES.USER,
        id: user._id
      };
    }

    return this.createDoc({
      activity: {
        type: ACTIVITY_TYPES.COMPANY,
        action: ACTIVITY_ACTIONS.CREATE,
        content: company.primaryName,
        id: company._id
      },
      coc: {
        type: COC_CONTENT_TYPES.COMPANY,
        id: company._id
      },
      performer
    });
  }

  /**
   * Creates a deal company registration log
   * @param {Company} deal - Deal document
   * @param {user} user - User document
   * @return {Promise} Return Promise resolving created ActivityLog
   */
  public static createDealRegistrationLog(deal: IDealInput, user: IUserInput) {
    let performer = null;

    if (user && user._id) {
      performer = {
        type: ACTIVITY_PERFORMER_TYPES.USER,
        id: user._id
      };
    }

    return this.createDoc({
      activity: {
        type: ACTIVITY_TYPES.DEAL,
        action: ACTIVITY_ACTIONS.CREATE,
        content: deal.name,
        id: deal._id
      },
      coc: {
        type: COC_CONTENT_TYPES.DEAL,
        id: deal._id
      },
      performer
    });
  }

  /**
   * Transfers customers' activity logs to another customer
   * @param {String} newCustomerId - Customer id to set
   * @param {String[]} customerIds - Old customer ids to change
   * @return {Promise} Updated alist of ctivity logs of new customer
   */
  public static async changeCustomer(
    newCustomerId: string,
    customerIds: string[]
  ) {
    for (const customerId of customerIds) {
      // Updating every activity log of customer
      await ActivityLogs.updateMany(
        { coc: { id: customerId, type: COC_CONTENT_TYPES.CUSTOMER } },
        {
          $set: { coc: { type: COC_CONTENT_TYPES.CUSTOMER, id: newCustomerId } }
        }
      );
    }

    // Returning updated list of activity logs of new customer
    return ActivityLogs.find({
      coc: { type: COC_CONTENT_TYPES.CUSTOMER, id: newCustomerId }
    });
  }

  /**
   * Removes customer's activity logs
   * @param {String} customerId - Customer id that belongs to activity logs
   * @return {Promise} Result
   */
  public static async removeCustomerActivityLog(customerId: string) {
    // Removing every activity log of customer
    return ActivityLogs.remove({
      coc: { type: COC_CONTENT_TYPES.CUSTOMER, id: customerId }
    });
  }

  /**
   * Removes company's activity logs
   * @param {String} companyId - Company id that belongs to activity logs
   * @return {Promise} Result
   */
  public static async removeCompanyActivityLog(companyId: string) {
    // Removing every activity log of company
    return ActivityLogs.remove({
      coc: { type: COC_CONTENT_TYPES.COMPANY, id: companyId }
    });
  }

  /**
   * Transfers companies' activity logs to another company
   * @param {String} newCompanyId - Company idsto set
   * @param {String[]} companyIds - Old company ids to change
   * @return {Promise} Updated list of activity logs of new company
   */
  public static async changeCompany(
    newCompanyId: string,
    companyIds: string[]
  ) {
    for (const companyId of companyIds) {
      // Updating every activity log of company
      await ActivityLogs.updateMany(
        { coc: { id: companyId, type: COC_CONTENT_TYPES.COMPANY } },
        { $set: { coc: { type: COC_CONTENT_TYPES.COMPANY, id: newCompanyId } } }
      );
    }

    // Returning updated list of activity logs of new company
    return ActivityLogs.find({
      coc: { type: COC_CONTENT_TYPES.COMPANY, id: newCompanyId }
    });
  }
}

activityLogSchema.loadClass(ActivityLog);

const ActivityLogs = model<IActivityLog, IActivityLogModel>(
  "activity_logs",
  activityLogSchema
);

export default ActivityLogs;
