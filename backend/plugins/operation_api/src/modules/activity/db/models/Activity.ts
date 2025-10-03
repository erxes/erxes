import { Model } from 'mongoose';

import { IModels } from '~/connectionResolvers';

import { activitySchema } from '@/activity/db/definitions/activity';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import {
  IActivity,
  IActivityDocument,
  IActivityUpdate,
} from '@/activity/types';

export interface IActivityModel extends Model<IActivityDocument> {
  createActivity(doc: IActivity): Promise<IActivityDocument>;
  updateActivity(doc: IActivityUpdate): Promise<IActivityDocument | null>;
  removeActivity(activityId: string): Promise<IActivityDocument | null>;
}

export const loadActivityClass = (models: IModels) => {
  class Activity {
    public static async createActivity(
      doc: IActivity,
    ): Promise<IActivityDocument> {
      const activity = await models.Activity.create(doc);

      await graphqlPubsub.publish(`operationActivityChanged:${doc.contentId}`, {
        operationActivityChanged: {
          type: 'created',
          activity,
        },
      });

      return activity;
    }

    public static async updateActivity(
      doc: IActivityDocument,
    ): Promise<IActivityDocument | null> {
      const { _id, ...rest } = doc;

      const updatedActivity = await models.Activity.findOneAndUpdate(
        { _id },
        { $set: { ...rest } },
        { new: true },
      );

      await graphqlPubsub.publish(`operationActivityChanged:${doc.contentId}`, {
        operationActivityChanged: {
          type: 'updated',
          activity: updatedActivity,
        },
      });

      return updatedActivity;
    }

    public static async removeActivity(
      activityId: string,
    ): Promise<IActivityDocument | null> {
      const deletedActivity = await models.Activity.findOneAndDelete({
        _id: activityId,
      });

      await graphqlPubsub.publish(
        `operationActivityChanged:${deletedActivity?.contentId}`,
        {
          operationActivityChanged: {
            type: 'removed',
            activity: deletedActivity,
          },
        },
      );

      return deletedActivity;
    }
  }

  activitySchema.loadClass(Activity);

  return activitySchema;
};
