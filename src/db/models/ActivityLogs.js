import mongoose from 'mongoose';
import Random from 'meteor-random';
import { CUSTOMER_CONTENT_TYPES } from '../../data/constants';

export const ACTIVITY_TYPES = {
  USER_REGISTERED: 'user_registered',
  COMPANY_REGISTERED: 'company_registered',
  INTERNAL_NOTE_CREATED: 'internal_note_created',
  CONVERSATION_CREATED: 'conversation_created',
  SEGMENT_UPDATED: 'segment_updated',

  ALL: [
    'user_registered',
    'company_registered',
    'internal_note_created',
    'conversation_created',
    'segment_updated',
  ],
};

export const ACTION_PERFORMER_TYPES = {
  SYSTEM: 'ACTION_PERFORMER_SYSTEM',
  USER: 'ACTION_PERFORMER_USER',

  ALL: ['ACTION_PERFORMER_SYSTEM', 'ACTION_PERFORMER_USER'],
};

export const ACTION_PERFORMER_SYSTEM = 'ACTION_PERFORMER_SYSTEM';

const ActionPerformer = mongoose.Schema({
  type: {
    type: String,
    enum: ACTION_PERFORMER_TYPES.ALL,
    default: ACTION_PERFORMER_TYPES.SYSTEM,
    required: true,
  },
  id: {
    type: String,
  },
});

const ActivityLogSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  activityType: {
    type: String,
    required: true,
    enum: ACTIVITY_TYPES.ALL,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  contentTypeId: {
    type: String,
    required: true,
  },
  contentType: {
    type: String,
    enum: CUSTOMER_CONTENT_TYPES.ALL,
    required: true,
  },
  performedBy: ActionPerformer,
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
   * @param {User|undefined} performedBy - User collection document
   * @return {Promise} returns Promise resolving created ActivityLog document
   */
  static createInternalNoteLog(internalNote, performedBy) {
    if (performedBy == null || (performedBy && !performedBy._id)) {
      throw new Error(`'performedBy' must be supplied when adding activity log for internal note`);
    }
    return this.createDoc({
      activityType: ACTIVITY_TYPES.INTERNAL_NOTE_CREATED,
      contentType: internalNote.contentType,
      contentTypeId: internalNote._id,
      performedBy,
    });
  }
}

ActivityLogSchema.loadClass(ActivityLog);

export default mongoose.model('activity_logs', ActivityLogSchema);
