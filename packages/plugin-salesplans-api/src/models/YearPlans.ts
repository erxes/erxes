import { IUserDocument } from '@erxes/api-utils/src/types';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  IYearPlan,
  IYearPlanDocument,
  yearPlanSchema
} from './definitions/yearPlans';

export interface IYearPlanModel extends Model<IYearPlanDocument> {
  getYearPlan(filter: any): Promise<IYearPlanDocument>;
  yearPlanAdd(doc: IYearPlan): Promise<IYearPlanDocument>;
  yearPlanEdit(
    _id: string,
    doc: IYearPlan,
    user: IUserDocument
  ): Promise<IYearPlanDocument>;
  yearPlansRemove(_ids: string[]): Promise<JSON>;
  yearPlansPublish(_ids: string[]): Promise<IYearPlanDocument[]>;
}
export const loadYearPlanClass = (models: IModels) => {
  class YearPlan {
    public static async getYearPlan(filter: any) {
      const plan = models.YearPlans.findOne({ ...filter }).lean();
      if (!plan) {
        throw new Error('Not found year plan');
      }
      return plan;
    }

    public static async yearPlanAdd(doc: IYearPlan) {
      return models.YearPlans.create({ ...doc });
    }

    public static async yearPlanEdit(
      _id: string,
      doc: IYearPlan,
      user: IUserDocument
    ) {
      await models.YearPlans.updateOne(
        { _id },
        { $set: { ...doc, modifiedAt: new Date(), modifiedBy: user._id } }
      );
      return await models.YearPlans.findOne({ _id }).lean();
    }

    public static async yearPlansRemove(_ids: string[]) {
      return await models.YearPlans.deleteMany({ _id: { $in: _ids } });
    }

    public static async yearPlansPublish(_ids: string[]) {
      return await models.YearPlans.updateMany(
        { _id: { $in: _ids } },
        {
          $set: {
            status: 'publish',
            confirmedData: {
              date: new Date(),
              values: '$values'
            }
          }
        }
      );
    }
  }

  yearPlanSchema.loadClass(YearPlan);

  return yearPlanSchema;
};
