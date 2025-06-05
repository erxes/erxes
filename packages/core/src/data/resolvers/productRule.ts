import { IContext } from "../../connectionResolver";
import { IProductRuleDocument } from "../../db/models/definitions/productRules";

export default {
  async categories(rule: IProductRuleDocument, _params, { models }: IContext) {
    return models.ProductCategories.find({ _id: { $in: rule.categoryIds } }).lean();
  },
  async excludeCategories(rule: IProductRuleDocument, _params, { models }: IContext) {
    return models.ProductCategories.find({ _id: { $in: rule.excludeCategoryIds } }).lean();
  },
  async products(rule: IProductRuleDocument, _params, { models }: IContext) {
    return models.Products.find({ _id: { $in: rule.productIds } }).lean();
  },
  async excludeProducts(rule: IProductRuleDocument, _params, { models }: IContext) {
    return models.Products.find({ _id: { $in: rule.excludeProductIds } }).lean();
  },
  async tags(rule: IProductRuleDocument, _params, { models }: IContext) {
    return models.Tags.find({ _id: { $in: rule.tagIds } }).lean();
  },
  async excludeTags(rule: IProductRuleDocument, _params, { models }: IContext) {
    return models.Tags.find({ _id: { $in: rule.excludeTagIds } }).lean();
  },
};
