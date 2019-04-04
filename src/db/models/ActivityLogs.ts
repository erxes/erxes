import { Model, model } from 'mongoose';
import { pubsub } from '../../data/resolvers/subscriptions';
import {
  activityLogSchema,
  IActionPerformer,
  IActivity,
  IActivityLogDocument,
  IContentType,
} from './definitions/activityLogs';
import { ACTIVITY_ACTIONS, ACTIVITY_PERFORMER_TYPES, ACTIVITY_TYPES } from './definitions/constants';
import { ICustomerDocument } from './definitions/customers';
import { ISegmentDocument } from './definitions/segments';

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
  createSegmentLog(segment: ISegmentDocument, customer?: ICustomerDocument): Promise<IActivityLogDocument>;
}

export const loadClass = () => {
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

      pubsub.publish('activityLogsChanged', { activityLogsChanged: true });

      return log;
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
