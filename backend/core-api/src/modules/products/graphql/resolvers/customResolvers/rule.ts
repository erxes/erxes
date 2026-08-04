import { IProductRuleDocument } from '@/products/@types/rule';
import { IContext } from '~/connectionResolvers';

export default {
  async categories(
    rule: IProductRuleDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    if (!rule.categoryIds?.length) return [];

    return models.ProductCategories.find({
      _id: { $in: rule.categoryIds },
    }).lean();
  },

  async excludeCategories(
    rule: IProductRuleDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    if (!rule.excludeCategoryIds?.length) return [];

    return models.ProductCategories.find({
      _id: { $in: rule.excludeCategoryIds },
    }).lean();
  },

  async products(
    rule: IProductRuleDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    if (!rule.productIds?.length) return [];

    return models.Products.find({ _id: { $in: rule.productIds } }).lean();
  },

  async excludeProducts(
    rule: IProductRuleDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    if (!rule.excludeProductIds?.length) return [];

    return models.Products.find({
      _id: { $in: rule.excludeProductIds },
    }).lean();
  },

  async tags(
    rule: IProductRuleDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    if (!rule.tagIds?.length) return [];

    return models.Tags.find({ _id: { $in: rule.tagIds } }).lean();
  },

  async excludeTags(
    rule: IProductRuleDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    if (!rule.excludeTagIds?.length) return [];

    return models.Tags.find({ _id: { $in: rule.excludeTagIds } }).lean();
  },
};
