import { Model } from "mongoose";
import { IModels } from "../../connectionResolver";
import {
  activityLogSchema,
  IActivityLogDocument,
  IActivityLogInput
} from "./definitions/activityLogs";

export interface IActivityLogModel extends Model<IActivityLogDocument> {
  addActivityLog(doc: IActivityLogInput): Promise<IActivityLogDocument>;
  addActivityLogs(docs: IActivityLogInput[]): Promise<IActivityLogDocument[]>;
  removeActivityLog(contentId: string): void;
  removeActivityLogs(
    contentType: string,
    contentIds: string[]
  ): Promise<{ n: number; ok: number }>;
}

export const loadActivityLogClass = (models: IModels, _subdomain: string) => {
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
