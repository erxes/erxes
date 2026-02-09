import { IContext } from '~/connectionResolvers';

export const bundleRuleQueries = {
  async bundleRules(_root: undefined, _args: undefined, { models }: IContext) {
    const bundles = await models.BundleRule.find({}).lean();

    const bundlesWithProducts: any[] = [];

    for (const bundle of bundles) {
      const rulesWithProducts: any[] = [];

      for (const rule of bundle.rules) {
        const products = await models.Products.find({
          _id: { $in: rule.productIds || [] },
        });

        rulesWithProducts.push({
          ...rule,
          products,
        });
      }

      bundlesWithProducts.push({
        ...bundle,
        rules: rulesWithProducts,
      });
    }

    return bundlesWithProducts;
  },

  async bundleRuleDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    const bundle = await models.BundleRule.findById(_id).lean();

    if (!bundle) {
      return null;
    }

    const rulesWithProducts: any[] = [];

    for (const rule of bundle.rules || []) {
      const products = await models.Products.find({
        _id: { $in: rule.productIds || [] },
      });

      rulesWithProducts.push({
        ...rule,
        products,
      });
    }

    return {
      ...bundle,
      rules: rulesWithProducts,
    };
  },
};
