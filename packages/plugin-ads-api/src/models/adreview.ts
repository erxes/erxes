import {
  adReviewSchema,
  IadReview,
  IadReviewDocument
} from './definitions/adreview';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';

export interface IadReviewModel extends Model<IadReviewDocument> {
  getAdReview(adId: string): Promise<IadReviewDocument>;
  createAdReview(doc: IadReview): Promise<IadReviewDocument>;
  updateAdReview(adId: string, doc: IadReview): Promise<IadReviewDocument>;
  removeAdReview(adId: string): Promise<IadReviewDocument>;
}

export const loadAdReviewClass = (models: IModels, subdomain: string) => {
  class AdReview {
    public static async getAdReview(adId: string) {
      return models.AdReview.findOne({ adId }).lean();
    }
    public static async createAdReview(doc: IadReview) {
      const review = await models.AdReview.create({
        ...doc,
        createdAt: new Date(),
        modifiedAt: new Date()
      });
      return review;
    }
    public static async updateAdReview(adId: string, doc: IadReview) {
      const current = await models.AdReview.getAdReview(doc?.adId);
      if (current) {
        const updated = await models.AdReview.updateOne(
          { adId },
          { $set: { ...doc, modifiedAt: new Date() } }
        );
      }
    }
    public static async removeAdReview(adId: string) {
      return models.AdReview.findOneAndRemove({ adId });
    }
  }
  adReviewSchema.loadClass(AdReview);
  return adReviewSchema;
};
