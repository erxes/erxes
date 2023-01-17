import { Model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import {
  IPricingPlan,
  IPricingPlanDocument,
  pricingPlanSchema
} from './definitions/pricingPlan';

export interface IPricingPlanModel extends Model<IPricingPlanDocument> {
  createPlan(doc: IPricingPlan, userId: string): Promise<IPricingPlanDocument>;
  updatePlan(
    id: string,
    doc: IPricingPlan,
    userId: string
  ): Promise<IPricingPlanDocument>;
  removePlan(id: string): Promise<IPricingPlanDocument>;
}

export const loadPricingPlanClass = (models: IModels) => {
  class PricingPlan {
    /**
     * Create pricing plan
     * @param doc Plan document to create
     * @param userId Requested user id
     * @returns Created plan document
     */
    public static async createPlan(doc: IPricingPlan, userId: string) {
      return models.PricingPlans.create({
        ...doc,
        createdAt: new Date(),
        createdBy: userId,
        updatedAt: new Date(),
        updatedBy: userId
      });
    }

    /**
     * Update plan
     * @param id Plan ID to update
     * @param doc Plan document to update
     * @param userId Requested user id
     * @returns Updated plan document
     */
    public static async updatePlan(
      id: string,
      doc: IPricingPlan | any,
      userId: string
    ) {
      const result = await models.PricingPlans.findById(id);

      if (!result) return new Error(`Can't find plan`);

      if (doc._id) delete doc._id;

      await models.PricingPlans.findByIdAndUpdate(id, {
        $set: {
          ...doc,
          updatedAt: new Date(),
          updatedBy: userId
        }
      });

      return await models.PricingPlans.findById(id);
    }

    /**
     * Remove plan
     * @param id Plan ID to remove
     * @returns Removed plan document
     */
    public static async removePlan(id: string) {
      const result = await models.PricingPlans.findById(id);

      if (!result) return new Error(`Can't find plan`);

      return await models.PricingPlans.findByIdAndDelete(id);
    }
  }

  pricingPlanSchema.loadClass(PricingPlan);

  return pricingPlanSchema;
};
