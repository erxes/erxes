import { Model } from 'mongoose';
import { IPlanDocument, planSchema } from './definitions/plan';
import { IModels } from '../connectionResolver';
import { validatePlan } from '../common/validateDoc';
export interface IPlanModel extends Model<IPlanDocument> {
  addPlan(): Promise<IPlanDocument>;
  editPlan(): Promise<IPlanDocument>;
  removePlan(): Promise<IPlanDocument>;
  archivePlan(): Promise<IPlanDocument>;
}

export const loadPlan = (models: IModels, subdomain: string) => {
  class Plan {
    public static async addPlan(doc) {
      try {
        await validatePlan({ models, doc });
      } catch (error) {
        throw new Error(error.message);
      }

      return models.Plan.create({ ...doc });
    }
    public static async editPlan(_id: string, doc: any) {}
    public static async removePlan(_id: string) {}
    public static async archivePlan(_id: string) {}
  }

  planSchema.loadClass(Plan);
  return planSchema;
};
