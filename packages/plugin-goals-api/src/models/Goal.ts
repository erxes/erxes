import { IUserDocument } from '@erxes/api-utils/src/types';
import { Model } from 'mongoose';
import {
  configSchema,
  IConfigDocument,
  IGoal,
  IGoalDocument,
  goalSchema
} from './definitions/goals';

export interface IGoalModel extends Model<IGoalDocument> {
  markAsRead(ids: string[], userId?: string): void;
  createGoal(
    doc: IGoal,
    createdUser?: IUserDocument | string
  ): Promise<IGoalDocument>;
  updateGoal(_id: string, doc: IGoal): Promise<IGoalDocument>;
  checkIfRead(userId: string, contentTypeId: string): Promise<boolean>;
  removeGoal(_id: string): void;
}

export const loadGoalClass = models => {
  class Goal {
    /**
     * Marks goals as read
     */
    public static markAsRead(ids: string[], userId: string) {
      let selector: any = { receiver: userId };

      if (ids && ids.length > 0) {
        selector = { _id: { $in: ids } };
      }

      return models.Goals.updateMany(
        selector,
        { $set: { isRead: true } },
        { multi: true }
      );
    }

    /**
     * Check if user has read goal
     */
    public static async checkIfRead(userId, contentTypeId) {
      const goal = await models.Goals.findOne({
        isRead: false,
        receiver: userId,
        contentTypeId
      });

      return goal ? false : true;
    }

    /**
     * Create a goal
     */
    public static async createGoal(doc: IGoal, createdUserId: string) {
      // if receiver is configured to get this goal
      const config = await models.GoalConfigurations.findOne({
        user: doc.receiver,
        notifType: doc.notifType
      });

      // receiver disabled this goal
      if (config && !config.isAllowed) {
        throw new Error('Configuration does not exist');
      }

      return models.Goals.create({
        ...doc,
        createdUser: createdUserId
      });
    }

    /**
     * Update a goal
     */
    public static async updateGoal(_id: string, doc: IGoal) {
      await models.Goals.updateOne({ _id }, doc);

      return models.Goals.findOne({ _id });
    }

    /**
     * Remove a goal
     */
    public static removeGoal(_id: string) {
      return models.Goals.deleteOne({ _id });
    }
  }

  goalSchema.loadClass(Goal);

  return goalSchema;
};

export interface IConfigModel extends Model<IConfigDocument> {
  createOrUpdateConfiguration(
    { notifType, isAllowed }: { notifType?: string; isAllowed?: boolean },
    user?: IUserDocument | string
  ): Promise<IConfigDocument>;
}

export const loadGoalConfigClass = models => {
  class Configuration {
    /**
     * Creates an new goal or updates already existing goal configuration
     */
    public static async createOrUpdateConfiguration(
      { notifType, isAllowed }: { notifType?: string; isAllowed?: boolean },
      user?: IUserDocument | string
    ) {
      const selector: any = { user, notifType };

      const oldOne = await models.GoalConfigurations.findOne(selector);

      // If already inserted then raise error
      if (oldOne) {
        await models.GoalConfigurations.updateOne(
          { _id: oldOne._id },
          { $set: { isAllowed } }
        );

        return models.GoalConfigurations.findOne({ _id: oldOne._id });
      }

      // If it is first time then insert
      selector.isAllowed = isAllowed;

      return models.GoalConfigurations.create(selector);
    }
  }

  configSchema.loadClass(Configuration);

  return configSchema;
};
