import { getPureDate, paginate } from '@erxes/api-utils/src/core';
// import {
//   checkPermission,
//   requireLogin
// } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { sendProductsMessage } from '../../../messageBroker';

interface IParam {
  search: string;
  type: string;
  startDate: Date;
  endDate: Date;
  inBranchId: string;
  outBranchId: string;
  inDepartmentId: string;
  outDepartmentId: string;
  productCategoryId: string;
  vendorIds: string[];
  productIds: string[];
  jobReferId: string;
}

const generateFilter = async (
  subdomain: string,
  params: IParam,
  commonQuerySelector
) => {
  const {
    search,
    startDate,
    endDate,
    inBranchId,
    inDepartmentId,
    outBranchId,
    outDepartmentId,
    type,
    jobReferId,
    productCategoryId,
    vendorIds,
    productIds
  } = params;
  const selector: any = { ...commonQuerySelector };

  if (startDate) {
    selector.endAt = { $gte: getPureDate(startDate) };
  }
  if (endDate) {
    selector.startAt = { $lte: getPureDate(endDate) };
  }

  if (search) {
    selector.name = new RegExp(`.*${search}.*`, 'i');
  }

  if (type) {
    selector.type = type;
  }

  if (outBranchId) {
    selector.outBranchId = outBranchId;
  }
  if (outDepartmentId) {
    selector.outDepartmentId = outDepartmentId;
  }

  if (inBranchId) {
    selector.inBranchId = inBranchId;
  }
  if (inDepartmentId) {
    selector.inDepartmentId = inDepartmentId;
  }

  let filterProductIds: string[] = [];
  let hasFilterProductIds: boolean = false;
  if (productCategoryId) {
    const limit = await sendProductsMessage({
      subdomain,
      action: 'count',
      data: { categoryId: productCategoryId },
      isRPC: true
    });

    const products = await sendProductsMessage({
      subdomain,
      action: 'find',
      data: { limit, categoryId: productCategoryId, fields: { _id: 1 } },
      isRPC: true
    });

    filterProductIds = products.map(pr => pr._id);
    hasFilterProductIds = true;
  }

  if (vendorIds && vendorIds.length) {
    const limit = await sendProductsMessage({
      subdomain,
      action: 'count',
      data: { query: { vendorId: { $in: vendorIds } } },
      isRPC: true
    });

    const products = await sendProductsMessage({
      subdomain,
      action: 'find',
      data: {
        limit,
        query: { vendorId: { $in: vendorIds } },
        fields: { _id: 1 }
      },
      isRPC: true
    });

    filterProductIds = filterProductIds.concat(products.map(pr => pr._id));
    hasFilterProductIds = true;
  }

  if (
    productIds &&
    productIds.length &&
    productIds.filter(p => p !== '').length
  ) {
    filterProductIds = filterProductIds.concat(productIds);
    hasFilterProductIds = true;
  }

  if (hasFilterProductIds) {
    selector.$or = [
      { 'inProducts.productId': { $in: filterProductIds } },
      { 'outProducts.productId': { $in: filterProductIds } }
    ];
  }

  if (jobReferId) {
    selector.typeId = jobReferId;
  }

  return selector;
};

const performQueries = {
  async performs(
    _root,
    params: IParam & {
      page: number;
      perPage: number;
    },
    { subdomain, models, commonQuerySelector }: IContext
  ) {
    const selector = await generateFilter(
      subdomain,
      params,
      commonQuerySelector
    );

    return paginate(models.Performs.find(selector).lean(), { ...params });
  },

  async performsCount(
    _root,
    params: IParam,
    { subdomain, models, commonQuerySelector }: IContext
  ) {
    const selector = await generateFilter(
      subdomain,
      params,
      commonQuerySelector
    );

    return models.Performs.find(selector).count();
  },

  performDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Performs.getPerform(_id);
  },

  async series(
    _root,
    {
      search,
      productId,
      ids,
      excludeIds,
      selfSeries,
      ...paginationArgs
    }: {
      search?: string;
      selfSeries?: string;
      productId?: string;
      ids?: string[];
      excludeIds?: boolean;
      page?: number;
      perPage?: number;
    },
    { models }: IContext
  ) {
    const filter: any = {
      $and: [{ series: { $nin: ['', undefined, null, 0, selfSeries] } }]
    };

    if (ids && ids.length > 0) {
      filter.$and.push({
        series: { [excludeIds ? '$nin' : '$in']: ids }
      });
      if (!paginationArgs.page && !paginationArgs.perPage) {
        paginationArgs.page = 1;
        paginationArgs.perPage = 100;
      }
    }

    if (productId) {
      filter.$and.push({ ['outProducts.productId']: { $in: [productId] } });
    }

    if (search) {
      filter.$and.push({ series: { $regex: new RegExp(search) } });
    }

    const performs = await paginate(
      models.Performs.find(filter, { series: 1 })
        .sort({ series: -1 })
        .lean(),
      { ...paginationArgs }
    );

    const series = performs.map(p => p.series);

    let notPerformSeries: string[] = [];
    if (ids && ids.length && !excludeIds) {
      notPerformSeries = ids.filter(id => !series.includes(id));
    }

    return series.concat(notPerformSeries).map(ser => ({
      _id: ser,
      series: ser
    }));
  }
};

// checkPermission(workQueries, 'flows', 'showWorks');

export default performQueries;
