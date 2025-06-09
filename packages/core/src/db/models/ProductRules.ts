import { Model } from 'mongoose';
import * as _ from 'lodash';

import { IProductRule, IProductRuleDocument, productRuleSchema } from "./definitions/productRules";
import { IModels } from '../../connectionResolver';
import { isDescendantOf } from '../../data/modules/product/categoryUtils';

export interface IProductRuleModel extends Model<IProductRuleDocument> {
  getRule(_id: string): Promise<IProductRuleDocument>;
  createRule(doc: IProductRule): Promise<IProductRuleDocument>;
  updateRule(_id: string, doc: IProductRule): Promise<IProductRuleDocument>;
  removeRule(_id: string): void;
};


// clean duplicated values in both fields
const cleanDuplicates = (inc: string[] = [], exc: string[] = []) => {
  return {
    includes: _.difference(inc, exc),
    excludes: _.difference(exc, inc)
  };
}

const checkCategoryHierarchy = async (models: IModels, doc: IProductRule) => {
  const { categoryIds = [], excludeCategoryIds = [] } = doc;

  const includeCategories = await models.ProductCategories.find({ _id: { $in: categoryIds } }).lean();
  const excludeCategories = await models.ProductCategories.find({ _id: { $in: excludeCategoryIds } }).lean();

  for (const inc of includeCategories) {
    for (const exc of excludeCategories) {
      const incIsDescendant = isDescendantOf(inc, exc);

      if (!incIsDescendant) {
        throw new Error('You can not include a child category & exclude parent at the same time');
      }
    }
  }
};

const prepareDoc = (doc: IProductRule): IProductRule => {
  const categories = cleanDuplicates(doc.categoryIds, doc.excludeCategoryIds);
  const products = cleanDuplicates(doc.productIds, doc.excludeProductIds);
  const tags = cleanDuplicates(doc.tagIds, doc.excludeTagIds);

  return {
    ...doc,
    categoryIds: categories.includes,
    excludeCategoryIds: categories.excludes,
    productIds: products.includes,
    excludeProductIds: products.excludes,
    tagIds: tags.includes,
    excludeTagIds: tags.excludes
  };
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

      await checkCategoryHierarchy(models, preparedDoc);

      return models.ProductRules.create(preparedDoc);
    }

    public static async updateRule(_id: string, doc: IProductRule) {
      const rule = await models.ProductRules.getRule(_id);

      const preparedDoc = prepareDoc(doc);

      await checkCategoryHierarchy(models, preparedDoc);

      await models.ProductRules.updateOne({ _id: rule._id }, { $set: preparedDoc });

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
