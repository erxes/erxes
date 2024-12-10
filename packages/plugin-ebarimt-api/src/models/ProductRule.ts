import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { IProductRule, IProductRuleDocument, productRuleSchema } from './definitions/productRule';

export interface IProductRuleModel extends Model<IProductRuleDocument> {
  createProductRule(doc: IProductRule): Promise<IProductRuleDocument>;
  updateProductRule(
    _id: string,
    doc: IProductRule
  ): Promise<IProductRuleDocument>;
}

export const loadProductRuleClass = (models: IModels) => {
  class ProductRule {
    /**
     * Create a putResponse
     */
    public static async createProductRule(doc: IProductRule) {
      const response = await models.ProductRules.create({
        ...doc,
        createdAt: new Date()
      });

      return response;
    }

    /**
     * Update a putResponse
     */
    public static async updateProductRule(_id: string, doc: IProductRule) {
      const response = await models.ProductRules.updateOne(
        { _id },
        {
          $set: {
            ...doc,
            modifiedAt: new Date()
          }
        }
      );

      return response;
    }
  }

  productRuleSchema.loadClass(ProductRule);

  return productRuleSchema;
};
