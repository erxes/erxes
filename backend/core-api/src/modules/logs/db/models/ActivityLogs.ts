import {
  activityLogsSchema,
  IActivityLogDocument,
} from 'erxes-api-shared/core-modules';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import { Model } from 'mongoose';

// `contextType` is set at creation — it says what the entry happened inside
// of, which nothing later can work out on its own.
type CreateActivityLogInput = Omit<Partial<IActivityLogDocument>, 'createdAt'>;

export interface IActivityLogsModel extends Model<IActivityLogDocument> {
  createActivityLog(
    subdomain: string,
    doc: CreateActivityLogInput,
  ): Promise<IActivityLogDocument>;
}

export const loadActivityLogsClass = (models) => {
  class ActivityLogs {
    public static async createActivityLog(
      subdomain: string,
      doc: CreateActivityLogInput,
    ) {
      const targetId = doc.target?._id;
      const activityLog = await models.ActivityLogs.create({
        ...doc,
        targetId,
      });

      graphqlPubsub.publish(`activityLogInserted:${subdomain}:${targetId}`, {
        activityLogInserted: activityLog.toObject(),
      });

      return activityLog;
    }
  }

  activityLogsSchema.loadClass(ActivityLogs);

  return activityLogsSchema;
};
