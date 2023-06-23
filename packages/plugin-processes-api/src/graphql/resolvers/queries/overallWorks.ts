import { getPureDate, getToday, getTomorrow } from '@erxes/api-utils/src/core';
import { sendProductsMessage } from '../../../messageBroker';
// import {
//   checkPermission,
//   requireLogin
// } from '@erxes/api-utils/src/permissions';
import { IContext, IModels } from '../../../connectionResolver';
import { JOB_TYPES } from '../../../models/definitions/constants';
import { getProductsDataOnOwork } from './utils';
import { getProductsData } from '../customResolver/utils';

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
  productIds: string[];
  vendorIds: string[];
  jobCategoryId: string;
  jobReferId: string;
}

const generateFilter = async (
  subdomain: string,
  models: IModels,
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
    jobCategoryId,
    productCategoryId,
    productIds,
    vendorIds
  } = params;
  const selector: any = { ...commonQuerySelector };

  const dueQry: any = {};
  if (startDate) {
    dueQry.$gte = getPureDate(startDate);
  }
  if (endDate) {
    dueQry.$lte = getPureDate(endDate);
  }
  if (Object.keys(dueQry).length) {
    selector.dueDate = dueQry;
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

  if (vendorIds) {
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

  if (productIds) {
    filterProductIds = filterProductIds.concat(productIds);
    hasFilterProductIds = true;
  }

  if (hasFilterProductIds) {
    selector.typeId = { $in: filterProductIds };
  }

  if (jobCategoryId) {
    const category = await models.JobCategories.findOne({
      _id: jobCategoryId
    }).lean();
    const categories = await models.JobCategories.find(
      { order: { $regex: new RegExp(category.order) } },
      { _id: 1 }
    ).lean();
    const jobRefers = await models.JobRefers.find({
      categoryId: { $in: categories.map(c => c._id) }
    }).lean();
    selector.typeId = { $in: jobRefers.map(jr => jr._id) };
  }

  if (jobReferId) {
    selector.typeId = jobReferId;
  }

  if (!Object.keys(selector).length) {
    const dueQry: any = {};
    dueQry.$gte = getPureDate(getToday(getPureDate(new Date(), -1)));
    dueQry.$lte = getPureDate(getTomorrow(getPureDate(new Date(), -1)));

    if (Object.keys(dueQry).length) {
      selector.dueDate = dueQry;
    }
  }

  return selector;
};

const overallWorkQueries = {
  async overallWorks(
    _root,
    params: IParam & {
      page: number;
      perPage: number;
    },
    { models, commonQuerySelector, subdomain }: IContext
  ) {
    const selector = await generateFilter(
      subdomain,
      models,
      params,
      commonQuerySelector
    );

    const { page = 0, perPage = 0 } = params;
    const _page = Number(page || '1');
    const _limit = Number(perPage || '20');

    const groupedWorks = await models.Works.aggregate([
      { $match: selector },
      { $sort: { dueDate: 1 } },
      {
        $project: {
          _id: 1,
          inBranchId: 1,
          inDepartmentId: 1,
          outBranchId: 1,
          outDepartmentId: 1,
          dueDate: 1,
          needProducts: 1,
          resultProducts: 1,
          type: 1,
          typeId: 1,
          count: 1
        }
      },
      {
        $group: {
          _id: {
            inBranchId: '$inBranchId',
            inDepartmentId: '$inDepartmentId',
            outBranchId: '$outBranchId',
            outDepartmentId: '$outDepartmentId',
            type: '$type',
            typeId: '$typeId'
          },
          needProducts: { $push: '$needProducts' },
          resultProducts: { $push: '$resultProducts' },
          workIds: { $push: '$_id' },
          count: { $sum: '$count' }
        }
      },
      {
        $skip: (_page - 1) * _limit
      },
      {
        $limit: _limit
      },
      {
        $project: {
          _id: {
            $concat: [
              '$_id.type',
              '_',
              '$_id.typeId',
              '_',
              '$_id.inBranchId',
              '_',
              '$_id.inDepartmentId',
              '_',
              '$_id.outBranchId',
              '_',
              '$_id.outDepartmentId'
            ]
          },
          key: '$_id',
          needProducts: 1,
          resultProducts: 1,
          workIds: 1,
          count: 1
        }
      }
    ]);

    return groupedWorks;
  },

  async overallWorksCount(
    _root,
    params: IParam & {
      page: number;
      perPage: number;
    },
    { models, commonQuerySelector, subdomain }: IContext
  ) {
    const selector = await generateFilter(
      subdomain,
      models,
      params,
      commonQuerySelector
    );

    const groupedWorks = await models.Works.aggregate([
      { $match: selector },
      {
        $project: {
          _id: 1,
          inBranchId: 1,
          inDepartmentId: 1,
          outBranchId: 1,
          outDepartmentId: 1
        }
      },
      {
        $group: {
          _id: {
            inBranchId: '$inBranchId',
            inDepartmentId: '$inDepartmentId',
            outBranchId: '$outBranchId',
            outDepartmentId: '$outDepartmentId',
            type: '$type',
            typeId: '$typeId'
          }
        }
      }
    ]);
    return groupedWorks.length;
  },

  async overallWorkDetail(
    _root,
    params: IParam,
    { models, commonQuerySelector, subdomain }: IContext
  ) {
    const {
      inBranchId,
      inDepartmentId,
      outBranchId,
      outDepartmentId,
      type,
      jobReferId
    } = params;

    if (!type) {
      throw new Error('Must choose type filter');
    }

    if (JOB_TYPES.JOBS.includes(type) && !jobReferId) {
      throw new Error('Must choose job refer');
    }

    if (JOB_TYPES.JOBS.includes(type) && !jobReferId) {
      throw new Error('Must choose job refer');
    }

    if (
      JOB_TYPES.JOBS.includes(type) &&
      !(inBranchId && inDepartmentId && outBranchId && outDepartmentId)
    ) {
      throw new Error('Must choose in and out location infos');
    }

    if (type === JOB_TYPES.INCOME && !(outBranchId && outDepartmentId)) {
      throw new Error('Must choose out location infos');
    }

    if (type === JOB_TYPES.OUTLET && !(inBranchId && inDepartmentId)) {
      throw new Error('Must choose in location infos');
    }

    if (
      type === JOB_TYPES.MOVE &&
      !((inBranchId && inDepartmentId) || (outBranchId && outDepartmentId))
    ) {
      throw new Error('Must choose in or out location infos');
    }

    const selector = await generateFilter(
      subdomain,
      models,
      params,
      commonQuerySelector
    );

    const groupedWorks = await models.Works.aggregate([
      { $match: selector },
      { $sort: { dueDate: 1 } },
      {
        $project: {
          _id: 1,
          inBranchId: 1,
          inDepartmentId: 1,
          outBranchId: 1,
          outDepartmentId: 1,
          dueDate: 1,
          needProducts: 1,
          resultProducts: 1,
          type: 1,
          typeId: 1,
          count: 1
        }
      },
      {
        $group: {
          _id: {
            inBranchId: '$inBranchId',
            inDepartmentId: '$inDepartmentId',
            outBranchId: '$outBranchId',
            outDepartmentId: '$outDepartmentId',
            type: '$type',
            typeId: '$typeId'
          },
          needProducts: { $push: '$needProducts' },
          resultProducts: { $push: '$resultProducts' },
          workIds: { $push: '$_id' },
          count: { $sum: '$count' }
        }
      },
      {
        $project: {
          _id: {
            $concat: [
              '$_id.type',
              '_',
              '$_id.inBranchId',
              '_',
              '$_id.inDepartmentId',
              '_',
              '$_id.outBranchId',
              '_',
              '$_id.outDepartmentId',
              '_',
              '$_id.typeId'
            ]
          },
          key: '$_id',
          needProducts: 1,
          resultProducts: 1,
          workIds: 1,
          count: 1
        }
      }
    ]);

    if (!groupedWorks.length) {
      throw new Error('not found overall work');
    }

    let overallWork = groupedWorks[0];

    if (JOB_TYPES.SINGLES.includes(type)) {
      let needData = [];
      let resultData = [];

      for (const work of groupedWorks) {
        needData = needData.concat(work.needProducts.map(w => w));
        resultData = resultData.concat(work.resultProducts.map(w => w));
      }
      overallWork.needProducts = needData;
      overallWork.resultProducts = resultData;
    }

    overallWork.needProducts =
      getProductsData(overallWork.needProducts || []) || [];

    overallWork.resultProducts =
      getProductsData(overallWork.resultProducts || []) || [];

    overallWork.needProductsData = await getProductsDataOnOwork(
      subdomain,
      overallWork.needProducts,
      overallWork.key.inBranchId,
      overallWork.key.inDepartmentId
    );

    overallWork.resultProductsData = await getProductsDataOnOwork(
      subdomain,
      overallWork.resultProducts,
      overallWork.key.outBranchId,
      overallWork.key.outDepartmentId
    );

    return overallWork;
  }
};

// checkPermission(overallWorkQueries, 'overalWorks', 'showWorks');

export default overallWorkQueries;
