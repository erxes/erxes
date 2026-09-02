import { Resolver } from 'erxes-api-shared/core-types';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { ARCHIVED_DEAL_STATUS } from '@/pms/constants';
import { IContext } from '~/connectionResolvers';

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

type PmsDeal = {
  _id: string;
  productsData?: Array<{
    productId: string;
    startDate?: Date;
    endDate?: Date;
  }>;
  startDate: Date;
  closeDate: Date;
};

// Shared PMS deal scan: resolve the pipeline's non-skipped stages, then read
// deals through the sales plugin's internal `deal.findMany` tRPC contract.
// `query` carries the caller-specific date/product conditions; `search`,
// `skip`, and `limit` flow through to the paginated room-list queries.
const fetchPmsDeals = async ({
  subdomain,
  pipelineId,
  skipStageIds,
  query,
  search,
  skip,
  limit,
}: {
  subdomain: string;
  pipelineId: string;
  skipStageIds?: string[];
  query: Record<string, unknown>;
  search?: string;
  skip?: number;
  limit?: number;
}): Promise<PmsDeal[]> => {
  const stages = await sendTRPCMessage({
    subdomain,
    method: 'query',
    pluginName: 'sales',
    module: 'stage',
    action: 'find',
    input: { pipelineId },
  });

  const stageIds = stages?.map((x) => x._id) || [];
  const stageIdFilter = stageIds.filter(
    (item) => !skipStageIds?.includes(item),
  );

  const deals = await sendTRPCMessage({
    subdomain,
    method: 'query',
    pluginName: 'sales',
    module: 'deal',
    action: 'findMany',
    input: {
      query: {
        status: { $ne: ARCHIVED_DEAL_STATUS },
        stageId: { $in: stageIdFilter },
        ...query,
      },
      ...(search ? { search } : {}),
      ...(skip !== undefined ? { skip } : {}),
      ...(limit !== undefined ? { limit } : {}),
    },
  });

  return (deals as PmsDeal[]) || [];
};

const getFilteredProducts = async ({
  subdomain,
  categoryIds,
  excludeCategoryIds,
  excludeProductIds,
}: {
  subdomain: string;
  categoryIds: string[];
  excludeCategoryIds: string[];
  excludeProductIds: string[];
}) => {
  if (!categoryIds.length) {
    return [];
  }

  const products = await sendTRPCMessage({
    subdomain,
    method: 'query',
    pluginName: 'core',
    module: 'products',
    action: 'find',
    input: { categoryIds },
    defaultValue: [],
  });

  const excludedCategoriesWithChildren = excludeCategoryIds.length
    ? await sendTRPCMessage({
        subdomain,
        method: 'query',
        pluginName: 'core',
        module: 'categories',
        action: 'withChilds',
        input: { ids: excludeCategoryIds },
        defaultValue: [],
      })
    : [];

  const excludedCategoryIdSet = new Set(
    excludedCategoriesWithChildren.map((category) => category._id),
  );
  const excludedProductIdSet = new Set(excludeProductIds);

  return products.filter(
    (product: any) =>
      !excludedProductIdSet.has(product._id) &&
      !excludedCategoryIdSet.has(product.categoryId),
  );
};

const configQueries: Record<string, Resolver> = {
  /**
   * Config object
   */
  async pmsConfigs(_root, _args, { models }: IContext) {
    return models.Configs.find({});
  },

  async pmsConfigsGetValue(
    _root,
    { code }: { code: string },
    { models }: IContext,
  ) {
    return await models.Configs.findOne({ code }).lean();
  },

  async rooms(
    _root,
    {
      branchId,
    }: {
      branchId: string;
    },
    { subdomain, models }: IContext,
  ) {
    const branch = branchId ? await models.PmsBranch.findById(branchId) : null;
    const roomCategoryIds = branch?.roomCategories || [];
    const excludeRoomCategoryIds = branch?.excludeRoomCategoryIds || [];
    const excludeRoomIds = branch?.excludeRoomIds || [];

    return getFilteredProducts({
      subdomain,
      categoryIds: roomCategoryIds,
      excludeCategoryIds: excludeRoomCategoryIds,
      excludeProductIds: excludeRoomIds,
    });
  },

  async extraProducts(
    _root,
    { branchId }: { branchId: string },
    { subdomain, models }: IContext,
  ) {
    const branch = branchId ? await models.PmsBranch.findById(branchId) : null;

    return getFilteredProducts({
      subdomain,
      categoryIds: branch?.extraProductCategories || [],
      excludeCategoryIds: branch?.excludeExtraProductCategoryIds || [],
      excludeProductIds: branch?.excludeExtraProductIds || [],
    });
  },

  async pmsAppointmentProducts(
    _root,
    { branchId }: { branchId: string },
    { subdomain, models }: IContext,
  ) {
    const branch = branchId ? await models.PmsBranch.findById(branchId) : null;

    if (!branch?.hasAppointment) {
      return [];
    }

    return getFilteredProducts({
      subdomain,
      categoryIds: branch.appointmentCategories || [],
      excludeCategoryIds: branch.excludeAppointmentCategoryIds || [],
      excludeProductIds: branch.excludeAppointmentIds || [],
    });
  },

  async pmsRooms(
    _root,
    {
      endDate,
      startDate,
      pipelineId,
      perPage = 50,
      page = 1,
      skipStageIds = [],
      search,
    }: {
      startDate: Date;
      endDate: Date;
      pipelineId: string;
      perPage: number;
      page: number;
      skipStageIds: string[];
      search: string;
    },
    { subdomain }: IContext,
  ) {
    return fetchPmsDeals({
      subdomain,
      pipelineId,
      skipStageIds,
      query: {
        productsData: {
          $elemMatch: {
            startDate: { $lte: new Date(endDate) }, // Document starts before your range ends
            endDate: { $gte: new Date(startDate) }, // Document ends after your range starts
          },
        },
      },
      search,
      skip: (page - 1) * perPage,
      limit: perPage,
    });
  },

  async cpPmsRooms(
    _root,
    {
      endDate,
      startDate,
      pipelineId,
      perPage = 50,
      page = 1,
      skipStageIds = [],
      search,
    }: {
      startDate: Date;
      endDate: Date;
      pipelineId: string;
      perPage: number;
      page: number;
      skipStageIds: string[];
      search?: string;
    },
    { models, subdomain }: IContext,
  ) {
    const deals = await fetchPmsDeals({
      subdomain,
      pipelineId,
      skipStageIds,
      query: {
        productsData: {
          $elemMatch: {
            startDate: { $lte: new Date(endDate) }, // Document starts before your range ends
            endDate: { $gte: new Date(startDate) }, // Document ends after your range starts
          },
        },
      },
      search,
      skip: (page - 1) * perPage,
      limit: perPage,
    });
    return deals;
  },

  async pmsCheckRooms(
    _root,
    {
      ids,
      endDate,
      startDate,
      pipelineId,
      skipStageIds = [],
    }: {
      startDate: Date;
      endDate: Date;
      pipelineId: string;
      ids: string[];
      skipStageIds: string[];
    },
    { models, subdomain }: IContext,
  ) {
    const searchStart = new Date(startDate);
    const searchEnd = new Date(endDate);

    const deals = await fetchPmsDeals({
      subdomain,
      pipelineId,
      skipStageIds,
      query: {
        // 1. Broad filter: Find any deal that touches our range and has our rooms
        productsData: {
          $elemMatch: { productId: { $in: ids } },
        },
        startDate: { $lt: searchEnd },
        closeDate: { $gt: searchStart },
      },
    });

    const busyProductIds = new Set<string>();

    for (const deal of deals || []) {
      for (const productData of deal.productsData || []) {
        // Ensure we only care about the products the user actually searched for
        if (!ids.includes(productData.productId)) continue;

        // Use the same universal overlap formula for the specific product dates
        // If productData doesn't have dates, fall back to the Deal's root dates
        const pStart = new Date(productData.startDate || deal.startDate);
        const pEnd = new Date(productData.endDate || deal.closeDate);

        const isOverlapping = pStart < searchEnd && pEnd > searchStart;

        if (isOverlapping) {
          busyProductIds.add(productData.productId);
        }
      }
    }

    // Return the IDs that are NOT in the busy list
    return ids
      .filter((id) => !busyProductIds.has(id))
      .map((id) => ({ _id: id }));
  },

  async cpPmsCheckRooms(
    _root,
    {
      ids,
      endDate,
      startDate,
      pipelineId,
      skipStageIds = [],
    }: {
      startDate: Date;
      endDate: Date;
      pipelineId: string;
      ids: string[];
      skipStageIds: string[];
    },
    { models, subdomain }: IContext,
  ) {
    const deals = await fetchPmsDeals({
      subdomain,
      pipelineId,
      skipStageIds,
      query: {
        productsData: {
          $elemMatch: {
            productId: { $in: ids },
            startDate: {
              $lte: new Date(endDate), // 🔥 important
            },
            endDate: {
              $gte: new Date(startDate), // 🔥 important
            },
          },
        },
      },
    });
    const array: any[] = [];
    for (const x of deals || []) {
      array.push(...(x?.productsData || []));
    }
    const productsFiltered = array.filter((productData) => {
      if (!ids.includes(productData.productId)) {
        return false;
      }
      if (productData.startDate && productData.endDate) {
        if (
          new Date(productData.startDate) <= new Date(startDate) &&
          new Date(startDate) <= new Date(productData.endDate) &&
          new Date(endDate) >= new Date(productData.endDate)
        ) {
          return true;
        }
        if (
          new Date(startDate) <= new Date(productData.startDate) &&
          new Date(endDate) >= new Date(productData.startDate)
        ) {
          return true;
        }
        return false;
      } else return false;
    });

    const productIds = productsFiltered.map((x) => x.productId);
    return (
      ids.filter((x) => !productIds.includes(x)).map((x) => ({ _id: x })) || []
    );
  },

  async pmsRoomCleaningList(
    _root,
    {
      ids,
      endDate,
      startDate,
      pipelineId,
    }: {
      startDate: Date;
      endDate: Date;
      pipelineId: string;
      ids: string[];
    },
    { models, subdomain }: IContext,
  ) {},
};

export default configQueries;

configQueries.cpPmsCheckRooms.wrapperConfig = {
  forClientPortal: true,
};

configQueries.cpPmsRooms.wrapperConfig = {
  forClientPortal: true,
};
