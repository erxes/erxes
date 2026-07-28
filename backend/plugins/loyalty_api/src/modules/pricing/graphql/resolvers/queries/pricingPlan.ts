import { IContext, IModels } from '~/connectionResolvers';
import dayjs from 'dayjs';
import { cursorPaginate, sendTRPCMessage } from 'erxes-api-shared/utils';
import {
  getAllowedProducts,
  getProductIdsForPlan,
} from '../../../utils/product';
import { IPricingPlanDocument } from '@/pricing/@types/pricingPlan';
import { checkPricing } from '../../../utils';

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
  productId: string,
): Promise<Record<string, any>> => {
  const planIds: string[] = [];
  const plans: IPricingPlanDocument[] = await models.PricingPlans.find(
    baseFilter,
  ).sort({
    priority: 1,
    value: 1,
  });

  for (const plan of plans) {
    const allowedProductIds = await getAllowedProducts(subdomain, plan, [
      productId,
    ]);
    if (allowedProductIds.includes(productId)) {
      planIds.push(plan._id);
    }
  }

  return { ...baseFilter, _id: { $in: planIds } };
};

const applyBooleanFilters = (
  filter: Record<string, any>,
  params: {
    isQuantityEnabled?: boolean;
    isPriceEnabled?: boolean;
    isExpiryEnabled?: boolean;
    isRepeatEnabled?: boolean;
  },
): Record<string, any> => {
  const {
    isQuantityEnabled,
    isPriceEnabled,
    isExpiryEnabled,
    isRepeatEnabled,
  } = params;

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
    priority?: string;
    branchId?: string;
    departmentId?: string;
    date?: string | Date;
    productId?: string;
    isQuantityEnabled?: boolean;
    isPriceEnabled?: boolean;
    isExpiryEnabled?: boolean;
    isRepeatEnabled?: boolean;
  },
): Promise<Record<string, any>> => {
  const { status, priority, branchId, departmentId, date, productId } = params;

  let filter: Record<string, any> = {};

  if (status && status !== 'all') {
    filter.status = status;
  }

  if (priority !== undefined && priority !== 'all') {
    filter.priority = priority;
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

  if (productId) {
    filter = await applyProductIdFilter(subdomain, models, filter, productId);
  }

  return filter;
};

export const pricingPlanQueries = {
  pricingPlans: async (
    _root: any,
    params: any,
    { subdomain, models, checkPermission }: IContext,
  ) => {
    await checkPermission('pricingPlanView');
    const filter = await generateFilter(subdomain, models, params);
    const { sortField, sortDirection } = params;
    const sort: any =
      sortField && sortDirection
        ? { [sortField]: sortDirection }
        : { updatedAt: -1 };

    if (params.findOne) {
      const docs = await models.PricingPlans.find(filter).sort(sort).limit(1);
      return docs || [];
    }

    const result = await cursorPaginate({
      model: models.PricingPlans,
      query: filter,
      params: {
        ...params,
        orderBy: sort,
      },
    });

    return Array.isArray(result?.list) ? result.list : [];
  },

  cpPricingPlans: async (
    _root: any,
    params: any,
    { subdomain, models }: IContext,
  ) => {
    const filter = await generateFilter(subdomain, models, params);
    const { sortField, sortDirection } = params;
    const sort: any =
      sortField && sortDirection
        ? { [sortField]: sortDirection }
        : { updatedAt: -1 };

    if (params.findOne) {
      const docs = await models.PricingPlans.find(filter).sort(sort).limit(1);

      return docs || [];
    }

    const result = await cursorPaginate({
      model: models.PricingPlans,
      query: filter,
      params: {
        ...params,
        orderBy: sort,
      },
    });

    return Array.isArray(result?.list) ? result.list : [];
  },

  pricingPlansCount: async (
    _root: any,
    params: any,
    { subdomain, models, checkPermission }: IContext,
  ) => {
    await checkPermission('pricingPlanView');
    const filter = await generateFilter(subdomain, models, params);
    return await models.PricingPlans.find(filter).countDocuments();
  },

  pricingPlanDetail: async (
    _root: any,
    { id }: { id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('pricingPlanView');
    return await models.PricingPlans.getPricingPlan(id);
  },

  pricingFixedValuesPage: async (
    _root: any,
    {
      pricingPlanId,
      page = 1,
      perPage = 50,
      search = '',
    }: {
      pricingPlanId: string;
      page?: number;
      perPage?: number;
      search?: string;
    },
    { models, subdomain, checkPermission }: IContext,
  ) => {
    await checkPermission('pricingPlanView');

    const plan = await models.PricingPlans.getPricingPlan(pricingPlanId);

    // Load all fixed values for this plan — small documents, no limit needed
    const allFixedValues = await models.PricingFixedValues.find({
      pricingPlanId,
    })
      .sort({ sortField: 1 })
      .lean();

    const fixedByProductId = new Map(
      allFixedValues.map((fv) => [fv.productId, fv]),
    );

    // Get all product IDs that belong to this plan
    const planProductIds = await getProductIdsForPlan(subdomain, plan);
    const planProductIdSet = new Set(planProductIds);

    // Stale: have a saved fixed value but product no longer on the plan
    const staleProductIds = allFixedValues
      .filter((fv) => !planProductIdSet.has(fv.productId ?? ''))
      .map((fv) => fv.productId);

    // Full list: plan products first (sorted by their fixed value's sortField),
    // then stale products at the end
    let candidateProductIds = [...planProductIds, ...staleProductIds];

    // Server-side search — filter by sortField (product code) from fixed values
    if (search) {
      const lower = search.toLowerCase();
      const matchedByCode = new Set(
        allFixedValues
          .filter((fv) => fv.sortField?.toLowerCase().includes(lower))
          .map((fv) => fv.productId),
      );
      const nameMatches: any[] = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'products',
        action: 'find',
        input: { query: { name: { $regex: search, $options: 'i' } } },
        defaultValue: [],
      });
      const matchedByName = new Set(
        nameMatches.map((p: any) => p._id.toString()),
      );
      candidateProductIds = candidateProductIds.filter(
        (id) => matchedByCode.has(id) || matchedByName.has(id),
      );
    }

    const totalCount = candidateProductIds.length;
    const skip = (page - 1) * perPage;
    const pageProductIds = candidateProductIds.slice(skip, skip + perPage);

    if (!pageProductIds.length) {
      return { list: [], totalCount };
    }

    // Fetch product details from core for this page only
    const products: any[] = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'products',
      action: 'find',
      input: { query: { _id: { $in: pageProductIds } } },
      defaultValue: [],
    });

    const productById = new Map(products.map((p) => [p._id.toString(), p]));

    const list = pageProductIds.map((productId) => {
      const product = productById.get(productId);
      const fixedValue = fixedByProductId.get(productId);
      const isActive = planProductIdSet.has(productId ?? '');

      let status = 'NEW';
      if (fixedValue && isActive) status = 'SAVED';
      else if (fixedValue && !isActive) status = 'STALE';

      return {
        _id: fixedValue?._id?.toString() || null,
        productId,
        productName: product?.name || `Unknown (${productId})`,
        sortField: fixedValue?.sortField || product?.code || '',
        uom: product?.uom || fixedValue?.uom || '',
        unitPrice: product?.unitPrice ?? fixedValue?.unitPrice ?? 0,
        newPrice: fixedValue?.newPrice ?? product?.unitPrice ?? 0,
        status,
      };
    });

    return { list, totalCount };
  },

  pricingCheckDiscount: async (
    _root: any,
    params: {
      prioritizeRule?: string;
      totalAmount: number;
      departmentId: string;
      branchId: string;
      pipelineId: string;
      customerType?: 'customer' | 'company' | 'user';
      customerId?: string;
      brokerType?: 'customer' | 'company' | 'user';
      brokerId?: string;
      products: Array<{
        itemId: string;
        productId: string;
        quantity: number;
        price: number;
        manufacturedDate?: string;
      }>;
    },
    { models, subdomain }: IContext,
  ) => {
    const {
      prioritizeRule = 'exclude',
      totalAmount,
      departmentId,
      branchId,
      products,
      pipelineId,
      customerType,
      customerId,
      brokerType,
      brokerId,
    } = params;

    return checkPricing({
      models,
      subdomain,
      prioritizeRule,
      totalAmount,
      departmentId,
      branchId,
      pipelineId,
      orderItems: products || [],
      customerType,
      customerId,
      brokerType,
      brokerId,
    });
  },
};

(pricingPlanQueries.cpPricingPlans as any).wrapperConfig = {
  forClientPortal: true,
};
