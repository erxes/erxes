import { IUserDocument } from '@erxes/api-utils/src/types';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  dayPlanSchema,
  IDayPlan,
  IDayPlanDocument
} from './definitions/dayPlans';

export interface IDayPlanModel extends Model<IDayPlanDocument> {
  getDayPlan(filter: any): Promise<IDayPlanDocument>;
  dayPlanAdd(doc: IDayPlan): Promise<IDayPlanDocument>;
  dayPlanEdit(
    _id: string,
    doc: IDayPlan,
    user: IUserDocument
  ): Promise<IDayPlanDocument>;
  dayPlansRemove(_ids: string[]): Promise<JSON>;
  dayPlansPublish(_ids: string[]): Promise<IDayPlanDocument[]>;
}
export const loadDayPlanClass = (models: IModels) => {
  class DayPlan {
    public static async getDayPlan(filter: any) {
      const plan = models.DayPlans.findOne({ ...filter }).lean();
      if (!plan) {
        throw new Error('Not found year plan');
      }
      return plan;
    }

    public static async dayPlansAdd(doc: IDayPlan) {
      return models.DayPlans.create({ ...doc });
    }

    public static async dayPlanEdit(
      _id: string,
      doc: IDayPlan,
      user: IUserDocument
    ) {
      await models.DayPlans.updateOne(
        { _id },
        { $set: { ...doc, modifiedAt: new Date(), modifiedBy: user._id } }
      );
      return await models.DayPlans.findOne({ _id }).lean();
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
