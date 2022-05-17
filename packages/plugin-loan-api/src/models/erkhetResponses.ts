import {
  erkhetResponseSchema,
  IErkhetResponseDocument
} from './definitions/erkhetResponses';
import { Model } from 'mongoose';

export interface IErkhetResponseModel extends Model<IErkhetResponseDocument> {
  getErkhetResponse(models, selector: any);
  createErkhetResponse(models, doc);
  updateErkhetResponse(models, _id, doc);
  removeErkhetResponses(models, _ids);
}
export const loadErkhetResponseClass = models => {
  class ErkhetResponse {
    /**
     *
     * Get ErkhetResponse
     */

    public static async getErkhetResponse(selector: any) {
      const insuranceType = await models.ErkhetResponses.findOne(selector);

      if (!insuranceType) {
        throw new Error('ErkhetResponse not found');
      }

      return insuranceType;
    }

    /**
     * Create a insuranceType
     */
    public static async createErkhetResponse(doc) {
      return models.ErkhetResponses.create(doc);
    }

    /**
     * Update ErkhetResponse
     */
    public static async updateErkhetResponse(_id, doc) {
      await models.ErkhetResponses.updateOne({ _id }, { $set: doc });

      return models.ErkhetResponses.findOne({ _id });
    }

    /**
     * Remove ErkhetResponse
     */
    public static async removeErkhetResponses(_ids) {
      // await models.ErkhetResponses.getErkhetResponseCatogery(models, { _id });
      // TODO: check collateralsData
      return models.ErkhetResponses.deleteMany({ _id: { $in: _ids } });
    }
  }
  erkhetResponseSchema.loadClass(ErkhetResponse);
  return erkhetResponseSchema;
};
