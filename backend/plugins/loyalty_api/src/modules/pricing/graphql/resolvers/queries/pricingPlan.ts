import { IContext, IModels } from '~/connectionResolvers';
import dayjs from 'dayjs';
import {
  moduleCheckPermission,
  moduleRequireLogin
} from 'erxes-api-shared/core-modules';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { getAllowedProducts } from '../../../utils/product';
import { IPricingPlanDocument } from '@/pricing/@types/pricingPlan';

const buildDateFilter = (date: string | Date) => {
  const now = dayjs(date);
  const nowISO = now.toISOString();
  
  return [
    {
      isStartDateEnabled: false,
      isEndDateEnabled: false,
    },
    {
      isStartDateEnabled: true,
      isEndDateEnabled: false,
      startDate: { $lt: nowISO },
    },
    {
      isStartDateEnabled: false,
      isEndDateEnabled: true,
      endDate: { $gt: nowISO },
    },
    {
      isStartDateEnabled: true,
      isEndDateEnabled: true,
      startDate: { $lt: nowISO },
      endDate: { $gt: nowISO },
    },
  ];
};

const applyProductIdFilter = async (
  subdomain: string,
  models: IModels,
  baseFilter: Record<string, any>,
  productId: string
): Promise<Record<string, any>> => {
  const planIds: string[] = [];
  const plans: IPricingPlanDocument[] = await models.PricingPlans.find(
    baseFilter,
  ).sort({
    isPriority: 1,
    value: 1,
  });
  
  for (const plan of plans) {
    const allowedProductIds = await getAllowedProducts(subdomain, plan, [productId]);
    if (allowedProductIds.includes(productId)) {
      planIds.push(plan._id);
    }
  }
  
  return { ...baseFilter, _id: { $in: planIds } };
};

const applyPrioritizeRuleFilter = (
  filter: Record<string, any>,
  prioritizeRule?: 'only' | 'exclude'
): Record<string, any> => {
  if (prioritizeRule === 'only') {
    return { ...filter, isPriority: true };
  }
  if (prioritizeRule === 'exclude') {
    return { ...filter, isPriority: false };
  }
  return filter;
};

const applyBooleanFilters = (
  filter: Record<string, any>,
  params: {
    isQuantityEnabled?: boolean;
    isPriceEnabled?: boolean;
    isExpiryEnabled?: boolean;
    isRepeatEnabled?: boolean;
  }
): Record<string, any> => {
  const { isQuantityEnabled, isPriceEnabled, isExpiryEnabled, isRepeatEnabled } = params;
  
  const updatedFilter = { ...filter };
  
  if (isQuantityEnabled !== undefined) {
    updatedFilter.isQuantityEnabled = isQuantityEnabled;
  }
  if (isPriceEnabled !== undefined) {
    updatedFilter.isPriceEnabled = isPriceEnabled;
  }
  if (isExpiryEnabled !== undefined) {
    updatedFilter.isExpiryEnabled = isExpiryEnabled;
  }
  if (isRepeatEnabled !== undefined) {
    updatedFilter.isRepeatEnabled = isRepeatEnabled;
  }
  
  return updatedFilter;
};

const generateFilter = async (
  subdomain: string,
  models: IModels,
  params: {
    status?: string;
    branchId?: string;
    departmentId?: string;
    date?: string | Date;
    productId?: string;
    prioritizeRule?: 'only' | 'exclude';
    isQuantityEnabled?: boolean;
    isPriceEnabled?: boolean;
    isExpiryEnabled?: boolean;
    isRepeatEnabled?: boolean;
  },
): Promise<Record<string, any>> => {
  const { status, branchId, departmentId, date, productId } = params;
  
  let filter: Record<string, any> = { status: 'active' };
  
  if (status) {
    filter.status = status;
  }
  
  if (branchId) {
    filter.branchIds = { $in: [branchId] };
  }
  
  if (departmentId) {
    filter.departmentIds = { $in: [departmentId] };
  }
  
  filter = applyBooleanFilters(filter, params);
  
  if (date) {
    filter.$or = buildDateFilter(date);
  }
  
  filter = applyPrioritizeRuleFilter(filter, params.prioritizeRule);
  
  if (productId) {
    filter = await applyProductIdFilter(subdomain, models, filter, productId);
  }
  
  return filter;
};

export const pricingPlanQueries = {
  pricingPlans: async (
    _root: any,
    params: any,
    { subdomain, models }: IContext
  ) => {
    const filter = await generateFilter(subdomain, models, params);
    const { sortField, sortDirection } = params;
    const sort: any =
      sortField && sortDirection
        ? { [sortField]: sortDirection }
        : { updatedAt: -1 };
    
    if (params.findOne) {
      return await models.PricingPlans.find(filter)
        .sort(sort)
        .limit(1);
    }
    
    return cursorPaginate({
      model: models.PricingPlans,
      query: filter,
      params: {
        ...params,
        orderBy: sort,
      },
    });
  },
  
  pricingPlansCount: async (
    _root: any,
    params: any,
    { subdomain, models }: IContext
  ) => {
    const filter = await generateFilter(subdomain, models, params);
    return await models.PricingPlans.find(filter).countDocuments();
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