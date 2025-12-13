import {
  productReviewSchema
} from '../definitions/productReview';
import {   
  IProductReview,
  IProductReviewDocument
} from '~/modules/ecommerce/@types/productReview'
import { Model } from 'mongoose';
import { IModels } from '../../../../connectionResolvers';

export interface IProductReviewModel extends Model<IProductReviewDocument> {
  getProductReviewById(_id: string): Promise<IProductReviewDocument>;
  getAllProductReview(customerId: string): Promise<IProductReviewDocument>;
  getProductReview(productId: string): Promise<IProductReviewDocument>;
  createProductReview(doc: IProductReview): Promise<IProductReviewDocument>;
  updateProductReview(
    _id: string,
    doc: IProductReview
  ): Promise<IProductReviewDocument>;
  removeProductReview(_id: string): Promise<IProductReviewDocument>;
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
    public static async createProductReview(doc: IProductReview) {
      const review = await models.ProductReview.create({
        ...doc,
        createdAt: new Date(),
        modifiedAt: new Date()
      });
      return review;
    }
    public static async updateProductReview(_id: string, doc: ProductReview) {
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
      return models.ProductReview.findOneAndDelete({ _id });
    }
  }
  productReviewSchema.loadClass(ProductReview);
  return productReviewSchema;
};
