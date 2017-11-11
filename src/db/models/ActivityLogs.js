import mongoose, { SchemaTypes } from 'mongoose';
import Random from 'meteor-random';
import {
  COC_CONTENT_TYPES,
  ACTION_PERFORMER_TYPES,
  ACTIVITY_TYPES,
  ACTIVITY_ACTIONS,
} from '../../data/constants';

/* Performer of the action:
   *system* cron job, user
   ex: Sales manager that has registered a new customer
   Sales manager is the action performer */
const ActionPerformer = mongoose.Schema(
  {
    type: {
      type: String,
      enum: ACTION_PERFORMER_TYPES.ALL,
      default: ACTION_PERFORMER_TYPES.SYSTEM,
      required: true,
    },
    id: {
      type: String,
    },
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
    type: {
      type: String,
      required: true,
      enum: ACTIVITY_TYPES.ALL,
    },
    action: {
      type: String,
      required: true,
      enum: ACTIVITY_ACTIONS.ALL,
    },
    content: {
      type: SchemaTypes.Mixed,
      default: {},
    },
    id: {
      type: String,
    },
  },
  { _id: false },
);

/* the customer that is related to a given ActivityLog
 can be both Company or Customer documents */
const Customer = mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: COC_CONTENT_TYPES.ALL,
      required: true,
    },
  },
  { _id: false },
);

const ActivityLogSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },

  activity: Activity,
  performedBy: ActionPerformer,
  coc: Customer,

  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

class ActivityLog {
  /**
   * Create an ActivityLog document
   * @param {Object|null} object1.performedBy - The performer of the action
   * @param {Object} object1 - Data to insert according to schema
   * @return {Promise} returns Promise resolving created ActivityLog document
   */
  static createDoc({ performedBy, ...doc }) {
    if (performedBy && performedBy._id) {
      performedBy = {
        type: ACTION_PERFORMER_TYPES.USER,
        id: performedBy._id,
      };
    } else if (!performedBy) {
      performedBy = {};
    }

    return this.create({ performedBy, ...doc });
  }

  /**
   * Create activity log for internal note
   * @param {InternalNote} internalNote - Internal note document
   * @param {User} performedBy - User collection document
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
      performedBy: user,
      coc: {
        id: internalNote.contentTypeId,
        type: internalNote.contentType,
      },
    });
  }

  /**
   * Create a conversation message log for a given customer,
   * if the customer is related to companies,
   * then create conversation log with all related companies
   * @param {Object} message - Conversation object
   * @param {string} message._id - Conversation document id
   * @param {Object} customer - Customer object
   * @param {string} customer.type - One of COC_CONTENT_TYPES choices
   * @param {string} customer.id - Customer document id
   */
  static async createConversationMessageLog(message, customer) {
    if (customer == null || (customer && !customer._id)) {
      throw new Error(`'customer' must be supplied when adding activity log for conversations`);
    }

    if (customer.companyIds && customer.companyIds.length > 0) {
      for (let companyId of customer.companyIds) {
        // check against duplication
        const foundLog = await this.findOne({
          'activity.type': ACTIVITY_TYPES.CONVERSATION_MESSAGE,
          'activity.action': ACTIVITY_ACTIONS.CREATE,
          'activity.id': message._id,
          'coc.type': COC_CONTENT_TYPES.COMPANY,
          'performedBy.type': ACTION_PERFORMER_TYPES.CUSTOMER,
          'coc.id': companyId,
        });

        if (!foundLog) {
          await this.createDoc({
            activity: {
              type: ACTIVITY_TYPES.CONVERSATION_MESSAGE,
              action: ACTIVITY_ACTIONS.CREATE,
              content: message.content,
              id: message._id,
            },
            performedBy: {
              type: ACTION_PERFORMER_TYPES.CUSTOMER,
            },
            coc: {
              type: COC_CONTENT_TYPES.COMPANY,
              id: companyId,
            },
          });
        }
      }
    }

    // check against duplication ======
    const foundLog = await this.findOne({
      'activity.type': ACTIVITY_TYPES.CONVERSATION_MESSAGE,
      'activity.action': ACTIVITY_ACTIONS.CREATE,
      'activity.id': message._id,
      'performedBy.type': ACTION_PERFORMER_TYPES.CUSTOMER,
      'coc.type': COC_CONTENT_TYPES.CUSTOMER,
      'coc.id': customer._id,
    });

    if (!foundLog) {
      return this.createDoc({
        activity: {
          type: ACTIVITY_TYPES.CONVERSATION_MESSAGE,
          action: ACTIVITY_ACTIONS.CREATE,
          content: message.content,
          id: message._id,
        },
        performedBy: {
          type: ACTION_PERFORMER_TYPES.CUSTOMER,
        },
        coc: {
          type: COC_CONTENT_TYPES.CUSTOMER,
          id: customer._id,
        },
      });
    }
  }

  /**
   * Create a customer or company segment log
   * @param {Segment} segment - Segment document
   * @param {Customer} customer - Related customer or company
   * @return {Promise} return Promise resolving created Segment
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
   * @param {user} user - user document
   * @return {Promise} return Promise resolving created ActivityLog
   */
  static createCustomerRegistrationLog(customer, user) {
    return this.createDoc({
      activity: {
        type: ACTIVITY_TYPES.CUSTOMER,
        action: ACTIVITY_ACTIONS.CREATE,
        content: customer.name,
        id: customer._id,
      },
      coc: {
        type: COC_CONTENT_TYPES.CUSTOMER,
        id: customer._id,
      },
      performedBy: user,
    });
  }

  /**
   * Creates a customer company registration log
   * @param {Company} company - Company document
   * @param {user} user - user document
   * @return {Promise} return Promise resolving created ActivityLog
   */
  static createCompanyRegistrationLog(company, user) {
    return this.createDoc({
      activity: {
        type: ACTIVITY_TYPES.COMPANY,
        action: ACTIVITY_ACTIONS.CREATE,
        content: company.name,
        id: company._id,
      },
      coc: {
        type: COC_CONTENT_TYPES.COMPANY,
        id: company._id,
      },
      performedBy: user,
    });
  }
}

ActivityLogSchema.loadClass(ActivityLog);

export default mongoose.model('activity_logs', ActivityLogSchema);
