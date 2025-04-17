import { checkPermission, requireLogin } from "@erxes/api-utils/src";
import { IContext } from "../../../connectionResolver";

interface IListArgs {
  page?: number;
  perPage?: number;
  searchValue?: string;
}

const queryBuilder = (params: IListArgs, brandIdSelector: any) => {
  const selector: any = { ...brandIdSelector };

  const { searchValue } = params;

  if (searchValue) {
    selector.name = new RegExp(`.*${params.searchValue}.*`, "i");
  }

  return selector;
};

const bundleQueries = {
  /**
   * All brands
   */
  async allBundleConditions(_root, {}, { brandIdSelector, models }: IContext) {
    return models.BundleCondition.find(brandIdSelector).lean();
  },

  /**
   * Brands list
   */
  async bundleConditions(
    _root,
    args: IListArgs,
    { brandIdSelector, models, user }: IContext
  ) {
    const selector = queryBuilder(args, brandIdSelector);

    return models.BundleCondition.find(selector).sort({ createdAt: -1 });
  },

  /**
   * Get one brand
   */
  async bundleConditionDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.BundleCondition.findOne({ _id });
  },

  /**
   * Get all brands count. We will use it in pager
   */
  async bundleConditionTotalCount(
    _root,
    _args,
    { brandIdSelector, models }: IContext
  ) {
    return models.BundleCondition.find(brandIdSelector).countDocuments();
  },

  async bundleRules(_root, {}, { brandIdSelector, models }: IContext) {
    const bundles = await models.BundleRule.find({}).lean();
    const bundlesWithProducts = bundles.map(async bundle => {
      const rules = bundle.rules.map(async rule => ({
        ...rule,
        products: await models.Products.find({
          _id: { $in: rule.productIds || [] }
        })
      }));
      return { ...bundle, rules: rules };
    });
    return bundlesWithProducts;
  },
  async bundleRuleDetail(
    _root,
    { _id }: { _id: string },
    { brandIdSelector, models }: IContext
  ) {
    const bundle = await models.BundleRule.findById(_id).lean();

    const rules = bundle?.rules.map(async rule => ({
      ...rule,
      products: await models.Products.find({
        _id: { $in: rule.productIds || [] }
      })
    }));
    return { ...bundle, rules: rules };
  }
};

requireLogin(bundleQueries, "bundleConditionTotalCount");
requireLogin(bundleQueries, "bundleConditions");
requireLogin(bundleQueries, "bundleConditionDetail");
requireLogin(bundleQueries, "allBundleConditions");

checkPermission(bundleQueries, "bundleConditions", "showBundles", []);
checkPermission(bundleQueries, "bundleRules", "showBundles", []);

export default bundleQueries;
