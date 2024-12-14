import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { IProductRule, IProductRuleDocument, productRuleSchema } from './definitions/productRule';

export interface IProductRuleModel extends Model<IProductRuleDocument> {
  createProductRule(doc: IProductRule): Promise<IProductRuleDocument>;
  updateProductRule(
    _id: string,
    doc: IProductRule
  ): Promise<IProductRuleDocument>;
  removeProductRules(ids: string[]): Promise<{ n: number; ok: number }>;
}

export const loadProductRuleClass = (models: IModels) => {
  class ProductRule {
    /**
     * Create a putResponse
     */
    public static async createProductRule(doc: IProductRule) {
      return await models.ProductRules.create({
        ...doc,
        createdAt: new Date()
      });
    }

    /**
     * Update a putResponse
     */
    public static async updateProductRule(_id: string, doc: IProductRule) {
      return await models.ProductRules.updateOne(
        { _id },
        {
          $set: {
            ...doc,
            modifiedAt: new Date()
          }
        }
      );
    }

    public static async removeProductRules(ids: string[]) {
      return models.ProductRules.deleteMany({ _id: { $in: ids } });
    }
  }

  productRuleSchema.loadClass(ProductRule);

  return productRuleSchema;
};
