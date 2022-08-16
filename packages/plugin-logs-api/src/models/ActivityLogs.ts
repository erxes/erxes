import * as Random from 'meteor-random';
import { Document, Model, Schema } from 'mongoose';
import { IModels } from '../connectionResolver';

import { field } from './utils';

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
  createdBy: field({ type: String, optional: true }),
  createdAt: field({
    type: Date,
    required: true,
    default: Date.now
  })
});

export interface IActivityLogModel extends Model<IActivityLogDocument> {
  addActivityLog(doc: IActivityLogInput): Promise<IActivityLogDocument>;
  addActivityLogs(docs: IActivityLogInput[]): Promise<IActivityLogDocument[]>;
  removeActivityLog(contentId: string): void;
  removeActivityLogs(
    contentType: string,
    contentIds: string[]
  ): Promise<{ n: number; ok: number }>;
}

export const loadClass = (models: IModels, subdomain: string) => {
  class ActivityLog {
    public static addActivityLog(doc: IActivityLogInput) {
      return models.ActivityLogs.create(doc);
    }

    public static addActivityLogs(docs: IActivityLogInput[]) {
      return models.ActivityLogs.insertMany(docs);
    }

    public static async removeActivityLog(contentId: IActivityLogInput) {
      await models.ActivityLogs.deleteMany({ contentId });
    }

    public static async removeActivityLogs(
      contentType: string,
      contentIds: string[]
    ) {
      // Removing every activity logs of contentType
      return models.ActivityLogs.deleteMany({
        contentType,
        contentId: { $in: contentIds }
      });
    }
  }

  activityLogSchema.loadClass(ActivityLog);

  return activityLogSchema;
};
