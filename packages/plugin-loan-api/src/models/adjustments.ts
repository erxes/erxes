import { adjustmentSchema } from './definitions/adjustments';
import { Model } from 'mongoose';
import { IAdjustmentDocument } from '../models/definitions/adjustments';

export const loadAdjustmentClass = models => {
  class Adjustment {
    /**
     *
     * Get Adjustment
     */

    public static async getAdjustment(selector: any) {
      const adjustment = await models.Adjustments.findOne(selector);

      if (!adjustment) {
        throw new Error('Adjustment not found');
      }

      return adjustment;
    }

    /**
     * Create a adjustment
     */
    public static async createAdjustment(doc) {
      return models.Adjustments.create(doc);
    }

    /**
     * Update Adjustment
     */
    public static async updateAdjustment(_id, doc) {
      await models.Adjustments.updateOne({ _id }, { $set: doc });

      return models.Adjustments.findOne({ _id });
    }

    /**
     * Remove Adjustment
     */
    public static async removeAdjustments(_ids) {
      return models.Adjustments.deleteMany({ _id: { $in: _ids } });
    }
  }
  adjustmentSchema.loadClass(Adjustment);
  return adjustmentSchema;
};
export interface IAdjustmentModel extends Model<IAdjustmentDocument> {
  getAdjustment(selector: any);
  createAdjustment(doc);
  updateAdjustment(_id, doc);
  removeAdjustments(_ids);
}
