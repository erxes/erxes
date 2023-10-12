import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { IGoal, IGoalDocument, goalSchema } from './definitions/goals';

export interface IGoalModel extends Model<IGoalDocument> {
  getGoal(_id: string): Promise<IGoalDocument>;
  createGoal(doc: IGoal): Promise<IGoalDocument>;
  updateGoal(_id: string, doc: IGoal): Promise<IGoalDocument>;
  removeGoal(_ids: string[]);
}

export const loadGoalClass = (models: IModels) => {
  class Goal {
    public static async createGoal(doc: IGoal, createdUserId: string) {
      return models.Goals.create({
        ...doc,
        createdDate: new Date(),
        createdUserId
      });
    }

    public static async getGoal(_id: string) {
      const goal = await models.Goals.findOne({ _id });

      if (!goal) {
        throw new Error('goal not found');
      }
      return goal;
    }

    public static async updateGoal(_id: string, doc: IGoal) {
      await models.Goals.updateOne(
        { _id },
        { $set: doc },
        { runValidators: true }
      );

      return models.Goals.findOne({ _id });
    }

    public static async removeGoal(_ids: string[]) {
      return models.Goals.deleteMany({ _id: { $in: _ids } });
      // const data = await models.Goals.getGoal(_id);
      // if (!data) {
      //   throw new Error(`not found with id ${_id}`);
      // }
      // return models.Goals.remove({ _id });
    }
  }

  goalSchema.loadClass(Goal);

  return goalSchema;
};
