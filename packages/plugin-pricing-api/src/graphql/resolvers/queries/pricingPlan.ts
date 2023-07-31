import { IContext } from '../../../connectionResolver';
import {
  moduleCheckPermission,
  moduleRequireLogin
} from '@erxes/api-utils/src/permissions';
import { paginate } from '@erxes/api-utils/src';
import { getMainConditions } from '../../../utils';
import { getAllowedProducts } from '../../../utils/product';
import { IPricingPlanDocument } from '../../../models/definitions/pricingPlan';

const generateFilter = async (subdomain, models, params) => {
  const {
    status,
    branchId,
    departmentId,
    date,
    productId,
    prioritizeRule
  } = params;
  const filter: any = getMainConditions(branchId, departmentId, date);

  if (status) filter.status = status;

  if (prioritizeRule === 'only') {
    filter.isPriority = true;
  } else if (prioritizeRule === 'exclude') {
    filter.isPriority = false;
  }

  if (productId) {
    const planIds: string[] = [];
    const plans: IPricingPlanDocument[] = await models.PricingPlans.find(
      filter
    ).sort({
      isPriority: 1,
      value: 1
    });
    let allowedProductIds: string[] = [];

    for (const plan of plans) {
      allowedProductIds = await getAllowedProducts(subdomain, plan, [
        productId
      ]);

      if (!allowedProductIds.includes(productId)) {
        continue;
      }

      planIds.push(plan._id);
    }

    filter._id = { $in: planIds };
  }

  return filter;
};

const pricingPlanQueries = {
  pricingPlans: async (
    _root: any,
    params: any,
    { subdomain, models }: IContext
  ) => {
    const filter = await generateFilter(subdomain, models, params);

    const { sortField, sortDirection } = params;

    const sort =
      sortField && sortDirection
        ? { [sortField]: sortDirection }
        : { updatedAt: -1 };

    if (params.findOne) {
      return models.PricingPlans.find(filter)
        .sort(sort)
        .limit(1);
    }

    return paginate(
      models.PricingPlans.find(filter)
        .sort(sort)
        .lean(),
      params
    );
  },

  pricingPlansCount: async (
    _root,
    params: any,
    { subdomain, models }: IContext
  ) => {
    const filter = await generateFilter(subdomain, models, params);

    return await models.PricingPlans.find(filter).count();
  },

  pricingPlanDetail: async (
    _root: any,
    { id }: { id: string },
    { models }: IContext
  ) => {
    return await models.PricingPlans.findById(id);
  }
};

moduleRequireLogin(pricingPlanQueries);
moduleCheckPermission(pricingPlanQueries, 'showPricing');

export default pricingPlanQueries;
