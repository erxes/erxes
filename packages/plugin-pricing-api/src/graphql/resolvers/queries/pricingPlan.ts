import { IContext } from '../../../connectionResolver';
import * as dayjs from 'dayjs';
import {
  moduleCheckPermission,
  moduleRequireLogin
} from '@erxes/api-utils/src/permissions';
import { paginate } from '@erxes/api-utils/src';
import { getAllowedProducts } from '../../../utils/product';
import { IPricingPlanDocument } from '../../../models/definitions/pricingPlan';

const generateFilter = async (subdomain, models, params) => {
  const {
    status,
    branchId,
    departmentId,
    date,
    productId,
    prioritizeRule,
    isQuantityEnabled,
    isPriceEnabled,
    isExpiryEnabled,
    isRepeatEnabled
  } = params;
  const filter: any = { status: 'active' };

  if (status) filter.status = status;

  if (branchId) {
    filter.branchIds = { $in: [branchId] };
  }

  if (departmentId) {
    filter.departmentIds = { $in: [departmentId] };
  }

  if (isQuantityEnabled !== undefined) {
    filter.isQuantityEnabled = isQuantityEnabled;
  }
  if (isPriceEnabled !== undefined) {
    filter.isPriceEnabled = isPriceEnabled;
  }
  if (isExpiryEnabled !== undefined) {
    filter.isExpiryEnabled = isExpiryEnabled;
  }
  if (isRepeatEnabled !== undefined) {
    filter.isRepeatEnabled = isRepeatEnabled;
  }

  if (date) {
    const now = dayjs(date);
    const nowISO = now.toISOString();
    filter.$or = [
      {
        isStartDateEnabled: false,
        isEndDateEnabled: false
      },
      {
        isStartDateEnabled: true,
        isEndDateEnabled: false,
        startDate: {
          $lt: nowISO
        }
      },
      {
        isStartDateEnabled: false,
        isEndDateEnabled: true,
        endDate: {
          $gt: nowISO
        }
      },
      {
        isStartDateEnabled: true,
        isEndDateEnabled: true,
        startDate: {
          $lt: nowISO
        },
        endDate: {
          $gt: nowISO
        }
      }
    ];
  }

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
