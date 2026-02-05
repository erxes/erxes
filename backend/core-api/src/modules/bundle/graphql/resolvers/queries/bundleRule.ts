import { IContext } from '~/connectionResolvers';

export const bundleRuleQueries = {
  async bundleRules(_root: undefined, _args: undefined, { models }: IContext) {
    const bundles = await models.BundleRule.find({}).lean();

    const bundlesWithProducts = bundles.map(async (bundle) => {
      const rules = bundle.rules.map(async (rule) => ({
        ...rule,
        products: await models.Products.find({
          _id: { $in: rule.productIds || [] },
        }),
      }));
      return { ...bundle, rules: rules };
    });

    return bundlesWithProducts;
  },

  async bundleRuleDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    const bundle = await models.BundleRule.findById(_id).lean();

    const rules = bundle?.rules.map(async (rule) => ({
      ...rule,
      products: await models.Products.find({
        _id: { $in: rule.productIds || [] },
      }),
    }));

    return { ...bundle, rules: rules };
  },
};
