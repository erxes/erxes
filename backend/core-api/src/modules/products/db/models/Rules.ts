import { IProductRule, IProductRuleDocument } from '@/products/@types/rule';
import { productRuleSchema } from '@/products/db/definitions/rules';
import { prepareDoc } from '@/products/utils/productRule';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface IProductRuleModel extends Model<IProductRuleDocument> {
  getRule(_id: string): Promise<IProductRuleDocument>;
  createRule(doc: IProductRule): Promise<IProductRuleDocument>;
  updateRule(_id: string, doc: IProductRule): Promise<IProductRuleDocument>;
  removeRule(_ids: string[]): void;
}

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
      const preparedDoc = prepareDoc(doc);

      return models.ProductRules.create(preparedDoc);
    }

    public static async updateRule(_id: string, doc: IProductRule) {
      const rule = await models.ProductRules.getRule(_id);

      const preparedDoc = prepareDoc(doc);

      return models.ProductRules.findOneAndUpdate(
        { _id: rule._id },
        { $set: preparedDoc },
        { new: true },
      );
    }

    public static async removeRule(_ids: string[]) {
      return models.ProductRules.deleteMany({ _id: { $in: _ids } });
    }
  }

  productRuleSchema.loadClass(ProductRule);

  return productRuleSchema;
};
