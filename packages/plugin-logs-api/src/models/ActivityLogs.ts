import * as Random from 'meteor-random';
import { Document, Model, model, Schema } from 'mongoose';

import { field } from './Logs';

export interface IActivityLogInput {
  action: string;
  content?: any;
  contentType: string;
  contentId: string;
  createdBy: string;
}

export interface IActivityLog {
  action: string;
  content?: any;
  contentType: string;
  contentId: string;
  createdBy: string;
}

export interface IActivityLogDocument extends IActivityLog, Document {
  _id: string;
  createdAt: Date;
}

export const activityLogSchema = new Schema({
  _id: { type: String, default: () => Random.id() },
  contentId: field({ type: String, index: true }),
  contentType: field({ type: String, index: true }),
  action: field({ type: String, index: true }),
  content: Schema.Types.Mixed,
  createdBy: field({ type: String }),
  createdAt: field({
    type: Date,
    required: true,
    default: Date.now
  })
});

interface IChecklistParams {
  item: any;
  contentType: string;
  action: string;
}

export interface IActivityLogModel extends Model<IActivityLogDocument> {
  addActivityLog(doc: IActivityLogInput): Promise<IActivityLogDocument>;
  addActivityLogs(docs: IActivityLogInput[]): Promise<IActivityLogDocument[]>;
  removeActivityLog(contentId: string): void;
  removeActivityLogs(
    contentType: string,
    contentIds: string[]
  ): Promise<{ n: number; ok: number }>;

  createSegmentLog(
    segment: any,
    contentIds: string[],
    type: string,
    maxBulk?: number
  );

  createChecklistLog(params: IChecklistParams): Promise<IActivityLogDocument>;
}

export const loadClass = () => {
  class ActivityLog {
    public static addActivityLog(doc: IActivityLogInput) {
      return ActivityLogs.create(doc);
    }

    public static addActivityLogs(docs: IActivityLogInput[]) {
      return ActivityLogs.insertMany(docs);
    }

    public static async removeActivityLog(contentId: IActivityLogInput) {
      await ActivityLogs.deleteMany({ contentId });
    }

    /**
     * Remove internal notes
     */
    public static async removeActivityLogs(
      contentType: string,
      contentIds: string[]
    ) {
      // Removing every activity logs of contentType
      return ActivityLogs.deleteMany({
        contentType,
        contentId: { $in: contentIds }
      });
    }

    /**
     * Create a customer or company segment logs
     */
    public static async createSegmentLog(
      segment: any,
      contentIds: string[] = [],
      type: string,
      maxBulk: number = 10000
    ) {
      const foundSegments = await ActivityLogs.find(
        {
          contentType: type,
          action: 'segment',
          contentId: { $in: contentIds },
          'content.id': segment._id
        },
        { contentId: 1 }
      );

      const foundContentIds = foundSegments.map(s => s.contentId);

      const diffContentIds = contentIds.filter(
        x => !foundContentIds.includes(x)
      );

      let bulkOpt: Array<{
        contentType: string;
        contentId: string;
        action: string;
        content: {};
      }> = [];

      let bulkCounter = 0;

      for (const contentId of diffContentIds) {
        bulkCounter = bulkCounter + 1;

        const doc = {
          contentType: type,
          contentId,
          action: 'segment',
          content: {
            id: segment._id,
            content: segment.name
          }
        };

        bulkOpt.push(doc);

        if (bulkCounter === maxBulk) {
          await ActivityLogs.insertMany(bulkOpt);
          bulkOpt = [];
          bulkCounter = 0;
        }
      }

      if (bulkOpt.length === 0) {
        return;
      }

      return ActivityLogs.insertMany(bulkOpt);
    }

    public static async createChecklistLog({
      item,
      contentType,
      action
    }: IChecklistParams) {
      if (action === 'delete') {
        await ActivityLogs.updateMany(
          { 'content._id': item._id },
          { $set: { 'content.name': item.title || item.content } }
        );
      }

      return ActivityLogs.addActivityLog({
        contentType,
        contentId: item.contentTypeId || item.checklistId,
        action,
        content: {
          _id: item._id,
          name: item.title || item.content
        },
        createdBy: item.createdUserId || ''
      });
    }
  }

  activityLogSchema.loadClass(ActivityLog);

  return activityLogSchema;
};

loadClass();

// tslint:disable-next-line
const ActivityLogs = model<IActivityLogDocument, IActivityLogModel>(
  'activity_logs',
  activityLogSchema
);

export default ActivityLogs;
