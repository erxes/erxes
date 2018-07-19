import mongoose, { SchemaTypes } from 'mongoose';
import { field } from './utils';
import {
  COC_CONTENT_TYPES,
  ACTIVITY_PERFORMER_TYPES,
  ACTIVITY_TYPES,
  ACTIVITY_ACTIONS,
} from '../../data/constants';

/* Performer of the action:
   *system* cron job, user
   ex: Sales manager that has registered a new customer
   Sales manager is the action performer */
const ActionPerformer = mongoose.Schema(
  {
    type: field({
      type: String,
      enum: ACTIVITY_PERFORMER_TYPES.ALL,
      default: ACTIVITY_PERFORMER_TYPES.SYSTEM,
      required: true,
    }),
    id: field({
      type: String,
    }),
  },
  { _id: false },
);

/*
   The action that is being performed
   ex1: A user writes an internal note
   in this case: type is InternalNote
                 action is create (write)
                 id is the InternalNote id
   ex2: Sales manager registers a new customer
   in this case: type is customer
                 action is create (register)
                 id is Customer id
   customer and activity contentTypes are the same in this case
   ex3: Cronjob runs and a customer is found to be suitable for a particular segment
                 action is create: a new segment user
                 type is segment
                 id is Segment id
   ex4: An internalNote concerning a customer was updated
                 action is update
                 type is InternalNote
                 id is InternalNote id
 */
const Activity = mongoose.Schema(
  {
    type: field({
      type: String,
      required: true,
      enum: ACTIVITY_TYPES.ALL,
    }),
    action: field({
      type: String,
      required: true,
      enum: ACTIVITY_ACTIONS.ALL,
    }),
    content: field({
      type: SchemaTypes.Mixed,
      default: {},
    }),
    id: field({
      type: String,
    }),
  },
  { _id: false },
);

/* the customer that is related to a given ActivityLog
 can be both Company or Customer documents */
const COC = mongoose.Schema(
  {
    id: field({
      type: String,
      required: true,
    }),
    type: field({
      type: String,
      enum: COC_CONTENT_TYPES.ALL,
      required: true,
    }),
  },
  { _id: false },
);

const ActivityLogSchema = mongoose.Schema({
  _id: field({ pkey: true }),
  activity: Activity,
  performedBy: ActionPerformer,
  coc: COC,

  createdAt: field({
    type: Date,
    required: true,
    default: Date.now,
  }),
});

class ActivityLog {
  /**
   * Create an ActivityLog document
   * @param {Object|null} object1.performer - The performer of the action
   * @param {Object} object1 - Data to insert according to schema
   * @return {Promise} returns Promise resolving created ActivityLog document
   */
  static createDoc({ performer, ...doc }) {
    let performedBy = {
      type: ACTIVITY_PERFORMER_TYPES.SYSTEM,
    };

    if (performer) {
      performedBy = performer;
    }

    return this.create({ performedBy, ...doc });
  }

  /**
   * Create activity log for internal note
   * @param {InternalNote} internalNote - Internal note document
   * @param {User} user - User collection document
   * @return {Promise} returns Promise resolving created ActivityLog document
   */
  static createInternalNoteLog(internalNote, user) {
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

  static cocFindOne(conversationId, cocId, cocType) {
    return this.findOne({
      'activity.type': ACTIVITY_TYPES.CONVERSATION,
      'activity.action': ACTIVITY_ACTIONS.CREATE,
      'activity.id': conversationId,
      'coc.type': cocType,
      'performedBy.type': ACTIVITY_PERFORMER_TYPES.CUSTOMER,
      'coc.id': cocId,
    });
  }

  static cocCreate(conversationId, content, cocId, cocType) {
    return this.createDoc({
      activity: {
        type: ACTIVITY_TYPES.CONVERSATION,
        action: ACTIVITY_ACTIONS.CREATE,
        content: content,
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
   * @param {Object} conversation - Conversation object
   * @param {string} conversation._id - Conversation document id
   * @param {Object} customer - Customer object
   * @param {string} customer.type - One of COC_CONTENT_TYPES choices
   * @param {string} customer.id - Customer document id
   */
  static async createConversationLog(conversation, customer) {
    if (customer == null || (customer && !customer._id)) {
      throw new Error(`'customer' must be supplied when adding activity log for conversations`);
    }

    if (customer.companyIds && customer.companyIds.length > 0) {
      for (let companyId of customer.companyIds) {
        // check against duplication
        const foundLog = await this.cocFindOne(
          conversation._id,
          companyId,
          COC_CONTENT_TYPES.COMPANY,
        );

        if (!foundLog) {
          await this.cocCreate(
            conversation._id,
            conversation.content,
            companyId,
            COC_CONTENT_TYPES.COMPANY,
          );
        }
      }
    }

    // check against duplication ======
    const foundLog = await this.cocFindOne(
      conversation._id,
      customer._id,
      COC_CONTENT_TYPES.CUSTOMER,
    );

    if (!foundLog) {
      return this.cocCreate(
        conversation._id,
        conversation.content,
        customer._id,
        COC_CONTENT_TYPES.CUSTOMER,
      );
    }
  }

  /**
   * Create a customer or company segment log
   * @param {Segment} segment - Segment document
   * @param {COC} customer - Related customer or company
   * @return {Promise} Return Promise resolving created Segment
   */
  static async createSegmentLog(segment, customer) {
    if (!customer) {
      throw new Error('customer must be supplied');
    }

    const foundSegment = await this.findOne({
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
   * @param {Customer} customer - Customer document
   * @param {user} user - User document
   * @return {Promise} Return Promise resolving created ActivityLog
   */
  static createCustomerRegistrationLog(customer, user) {
    let performer = null;

    if (user && user._id) {
      performer = {
        type: ACTIVITY_PERFORMER_TYPES.USER,
        id: user._id,
      };
    }

    return this.createDoc({
      activity: {
        type: ACTIVITY_TYPES.CUSTOMER,
        action: ACTIVITY_ACTIONS.CREATE,
        content: customer.getFullName(),
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
   * @param {Company} company - Company document
   * @param {user} user - User document
   * @return {Promise} Return Promise resolving created ActivityLog
   */
  static createCompanyRegistrationLog(company, user) {
    let performer = null;

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
        content: company.primaryName,
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
   * @param {Company} deal - Deal document
   * @param {user} user - User document
   * @return {Promise} Return Promise resolving created ActivityLog
   */
  static createDealRegistrationLog(deal, user) {
    let performer = null;

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
        content: deal.name,
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
   * @param {String} newCustomerId - Customer id to set
   * @param {String[]} customerIds - Old customer ids to change
   * @return {Promise} Updated alist of ctivity logs of new customer
   */
  static async changeCustomer(newCustomerId, customerIds) {
    for (let customerId of customerIds) {
      // Updating every activity log of customer
      await this.updateMany(
        { coc: { id: customerId, type: COC_CONTENT_TYPES.CUSTOMER } },
        {
          $set: { coc: { type: COC_CONTENT_TYPES.CUSTOMER, id: newCustomerId } },
        },
      );
    }

    // Returning updated list of activity logs of new customer
    return this.find({
      coc: { type: COC_CONTENT_TYPES.CUSTOMER, id: newCustomerId },
    });
  }

  /**
   * Removes customer's activity logs
   * @param {String} customerId - Customer id that belongs to activity logs
   * @return {Promise} Result
   */
  static async removeCustomerActivityLog(customerId) {
    // Removing every activity log of customer
    return await this.remove({
      coc: { type: COC_CONTENT_TYPES.CUSTOMER, id: customerId },
    });
  }

  /**
   * Removes company's activity logs
   * @param {String} companyId - Company id that belongs to activity logs
   * @return {Promise} Result
   */
  static async removeCompanyActivityLog(companyId) {
    // Removing every activity log of company
    return await this.remove({
      coc: { type: COC_CONTENT_TYPES.COMPANY, id: companyId },
    });
  }

  /**
   * Transfers companies' activity logs to another company
   * @param {String} newCompanyId - Company idsto set
   * @param {String[]} companyIds - Old company ids to change
   * @return {Promise} Updated list of activity logs of new company
   */
  static async changeCompany(newCompanyId, companyIds) {
    for (let companyId of companyIds) {
      // Updating every activity log of company
      await this.updateMany(
        { coc: { id: companyId, type: COC_CONTENT_TYPES.COMPANY } },
        { $set: { coc: { type: COC_CONTENT_TYPES.COMPANY, id: newCompanyId } } },
      );
    }

    // Returning updated list of activity logs of new company
    return this.find({
      coc: { type: COC_CONTENT_TYPES.COMPANY, id: newCompanyId },
    });
  }
}

ActivityLogSchema.loadClass(ActivityLog);

export default mongoose.model('activity_logs', ActivityLogSchema);
