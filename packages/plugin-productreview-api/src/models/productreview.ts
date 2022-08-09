import {
  productreviewSchema,
  IProductreview,
  IProductreviewDocument
} from './definitions/productreview';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';

export interface IProductReviewModel extends Model<IProductreviewDocument> {
  getProductReviewById(_id: string): Promise<IProductreviewDocument>;
  getAllProductReview(customerId: string): Promise<IProductreviewDocument>;
  getProductReview(productId: string): Promise<IProductreviewDocument>;
  createProductReview(doc: IProductreview): Promise<IProductreviewDocument>;
  updateProductReview(
    _id: string,
    doc: IProductreview
  ): Promise<IProductreviewDocument>;
  removeProductReview(_id: string): Promise<IProductreviewDocument>;
}

export const loadProductReviewClass = (models: IModels, subdomain: string) => {
  class ProductReview {
    public static async getProductReviewById(_id: string) {
      return models.ProductReview.findOne({ _id }).lean();
    }
    public static async getProductReview(productId: string) {
      return models.ProductReview.find({ productId }).lean();
    }
    public static async getAllProductReview(customerId: string) {
      return models.ProductReview.find({ customerId }).lean();
    }
    public static async createProductReview(doc: IProductreview) {
      const review = await models.ProductReview.create({
        ...doc,
        createdAt: new Date(),
        modifiedAt: new Date()
      });
      return review;
    }
    public static async updateProductReview(_id: string, doc: IProductreview) {
      const current = await models.ProductReview.getProductReviewById(_id);
      if (current) {
        await models.ProductReview.updateOne(
          { _id },
          { $set: { ...doc, modifiedAt: new Date() } }
        );
      }
      return models.ProductReview.findOne({ _id });
    }
    public static async removeProductReview(_id: string) {
      return models.ProductReview.findOneAndRemove({ _id });
    }
  }
  productreviewSchema.loadClass(ProductReview);
  return productreviewSchema;
};
