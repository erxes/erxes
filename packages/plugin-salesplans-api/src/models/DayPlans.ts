import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  dayPlanSchema,
  IDayPlan,
  IDayPlanDocument
} from './definitions/dayPlans';

export interface IDayPlanModel extends Model<IDayPlanDocument> {
  dayPlanAdd(doc: IDayPlan): Promise<IDayPlanDocument>;
  dayPlanEdit(_id: string, doc: IDayPlan): Promise<IDayPlanDocument>;
  dayPlanRemove(_ids: string[]): Promise<JSON>;
  dayPlansPublish(_ids: string[]): Promise<IDayPlanDocument[]>;
}
export const loadDayPlanClass = (models: IModels) => {
  class DayPlan {
    public static async dayPlansAdd(doc: IDayPlan) {
      return models.DayPlans.create({ ...doc });
    }

    public static async dayPlansEdit(_id: string, doc: IDayPlan) {
      return await models.DayPlans.updateOne({ _id }, { $set: { ...doc } });
    }

    public static async dayPlansRemove(_ids: string[]) {
      return await models.DayPlans.deleteMany({ _id: { $in: _ids } });
    }

    public static async dayPlansPublish(_ids: string[]) {
      return await models.DayPlans.updateMany(
        { _id: { $in: _ids } },
        {
          $set: {
            status: 'publish'
          }
        }
      );
    }
  }

  dayPlanSchema.loadClass(DayPlan);

  return dayPlanSchema;
};
