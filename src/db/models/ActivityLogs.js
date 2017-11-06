import mongoose from 'mongoose';
import Random from 'meteor-random';
import { CUSTOMER_CONTENT_TYPES } from '../../data/constants';

export const ACTIVITY_TYPES = {
  CUSTOMER: 'customer',
  COMPANY: 'company',
  INTERNAL_NOTE: 'internal_note',
  CONVERSATION: 'conversation',
  SEGMENT: 'segment',

  ALL: ['customer', 'company', 'internal_note', 'conversation', 'segment'],
};

export const ACTIVITY_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',

  ALL: ['create', 'update', 'delete'],
};

export const ACTION_PERFORMER_TYPES = {
  SYSTEM: 'ACTION_PERFORMER_SYSTEM',
  USER: 'ACTION_PERFORMER_USER',

  ALL: ['ACTION_PERFORMER_SYSTEM', 'ACTION_PERFORMER_USER'],
};

export const ACTION_PERFORMER_SYSTEM = 'ACTION_PERFORMER_SYSTEM';

// Performer of the action:
// *system* cron job, user
// ex: Sales manager that has registered a new customer
// Sales manager is the action performer
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

// The action that is being performed
// ex1: A user writes an internal note
// in this case: type is InternalNote
//               action is create (write)
//               id is the InternalNote id
// ex2: Sales manager registers a new customer
// in this case: type is customer
//               action is create (register)
//               id is Customer id
// customer and activity contentTypes are the same in this case
// ex3: Cronjob runs and a customer is found to be suitable for a particular segment
//               action is create: a new segment user
//               type is segment
//               id is Segment id
// ex4: An internalNote concerning a customer was updated
//               action is update
//               type is InternalNote
//               id is InternalNote id
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
    id: {
      type: String,
    },
  },
  { _id: false },
);

// the customer that is related to a given ActivityLog
// can be both Company or Customer documents
const Customer = mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: CUSTOMER_CONTENT_TYPES.ALL,
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
  customer: Customer,

  createdAt: {
    type: Date,
    required: true,
    default: Date.now(),
  },
});

class ActivityLog {
  static createDoc({ performedBy, ...doc }) {
    if (performedBy && performedBy._id) {
      performedBy = {
        type: ACTION_PERFORMER_TYPES.USER,
        id: performedBy._id,
      };
    } else {
      performedBy = {};
    }

    return this.create({ performedBy, ...doc });
  }

  /**
   * Create activity log for internal note
   * @param {InternalNote} internalNote - Internal note document
   * @param {User} performedBy - User collection document
   * @param {Customer|Company} customer - Customer or Company document
   * @return {Promise} returns Promise resolving created ActivityLog document
   */
  static createInternalNoteLog(internalNote, performedBy) {
    if (performedBy == null || (performedBy && !performedBy._id)) {
      throw new Error(`'performedBy' must be supplied when adding activity log for internal note`);
    }

    return this.createDoc({
      activity: {
        type: ACTIVITY_TYPES.INTERNAL_NOTE,
        action: ACTIVITY_ACTIONS.CREATE,
        id: internalNote._id,
      },
      performedBy,
      customer: {
        id: internalNote.contentTypeId,
        type: internalNote.contentType,
      },
    });
  }
}

ActivityLogSchema.loadClass(ActivityLog);

export default mongoose.model('activity_logs', ActivityLogSchema);
