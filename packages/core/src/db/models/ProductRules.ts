import { Model } from 'mongoose';

import { IProductRule, IProductRuleDocument, productRuleSchema } from "./definitions/productRules";
import { IModels } from '../../connectionResolver';

export interface IProductRuleModel extends Model<IProductRuleDocument> {
  getRule(_id: string): Promise<IProductRuleDocument>;
  createRule(doc: IProductRule): Promise<IProductRuleDocument>;
  updateRule(_id: string, doc: IProductRule): Promise<IProductRuleDocument>;
  removeRule(_id: string): void;
};

export const loadProductRuleClass = (models: IModels, _subdomain: string) => {
  class ProductRule {
    public static async getRule(_id: string) {
      const rule = await models.ProductRules.findById(_id);

      if (!rule) {
        throw new Error('Rule not found');
      }

      return rule;
    }

    public static async createRule(doc: IProductRule) {
      return models.ProductRules.create(doc);
    }

    public static async updateRule(_id: string, doc: IProductRule) {
      const rule = await models.ProductRules.getRule(_id);

      await models.ProductRules.updateOne({ _id: rule._id }, { $set: doc });

      return models.ProductRules.findOne({ _id });
    }

    // TODO: add related usage validations
    public static async removeRule(_id: string) {
      const rule = await models.ProductRules.getRule(_id);

      return models.ProductRules.deleteOne({ _id: rule._id });
    }
  }

  productRuleSchema.loadClass(ProductRule);

  return productRuleSchema;
};
