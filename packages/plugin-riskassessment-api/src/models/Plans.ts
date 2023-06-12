import { Model } from 'mongoose';
import { validatePlan } from '../common/validateDoc';
import { IModels } from '../connectionResolver';
import { IPlansDocument, plansSchema } from './definitions/plan';
export interface IPlansModel extends Model<IPlansDocument> {
  addPlan(doc, user): Promise<IPlansDocument>;
  editPlan(_id, doc): Promise<IPlansDocument>;
  removePlans(ids: string[]): Promise<IPlansDocument>;
  archivePlan(): Promise<IPlansDocument>;
  addSchedule(planId, doc): Promise<IPlansDocument>;
  editSchedule(args): Promise<IPlansDocument>;
  removeSchedule(_id): Promise<IPlansDocument>;
}

export const loadPlans = (models: IModels, subdomain: string) => {
  class Plans {
    public static async addPlan(doc, user) {
      try {
        await validatePlan({ models, doc });
      } catch (error) {
        throw new Error(error.message);
      }

      return models.Plans.create({ ...doc, plannerId: user.id });
    }

    public static async editPlan(_id, doc) {
      return models.Plans.findOneAndUpdate(_id, { $set: { ...doc } });
    }

    public static async removePlans(ids) {
      return models.Plans.deleteMany({ _id: { $in: ids } });
    }

    public static async addSchedule(planId: string, doc: any) {
      const plan = models.Plans.findOne({ _id: planId });

      if (!plan) {
        throw new Error('cannot find schedule');
      }

      if (
        await models.Schedules.findOne({
          date: doc.date,
          $or: [{ indicatorId: doc.indicatorId }, { groupId: doc.groupId }]
        })
      ) {
        throw new Error('cannot add schedule with selected date');
      }

      return await models.Schedules.create({ planId, ...doc });
    }

    public static async editSchedule(args: any) {
      const { _id, planId, ...doc } = args;

      return await models.Schedules.findOneAndUpdate(
        { _id, planId },
        { $set: { ...doc } }
      );
    }
    public static async removeSchedule(_id: string) {
      return await models.Schedules.findByIdAndDelete(_id);
    }
    public static async archivePlan(_id: string) {}
  }

  plansSchema.loadClass(Plans);
  return plansSchema;
};
