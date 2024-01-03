import {
  getPureDate,
  getToday,
  getTomorrow,
  paginate
} from '@erxes/api-utils/src/core';
// import {
//   checkPermission,
//   requireLogin
// } from '@erxes/api-utils/src/permissions';
import { IContext, IModels } from '../../../connectionResolver';
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
  productId: string;
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
    productId
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

    selector.typeId = { $in: products.map(pr => pr._id) };
  }

  if (productId) {
    selector.typeId = productId;
  }

  if (jobCategoryId) {
    const category = await models.JobCategories.findOne({
      _id: jobCategoryId
    }).lean();
    const categories = await models.JobCategories.find(
      { order: { $regex: new RegExp(`^${category.order}`) } },
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

const workQueries = {
  async works(
    _root,
    params: IParam & {
      page: number;
      perPage: number;
    },
    { subdomain, models, commonQuerySelector }: IContext
  ) {
    const selector = await generateFilter(
      subdomain,
      models,
      params,
      commonQuerySelector
    );

    return paginate(
      models.Works.find(selector)
        .sort({ dueDate: -1 })
        .lean(),
      { ...params }
    );
  },

  async worksTotalCount(
    _root,
    params: IParam,
    { subdomain, models, commonQuerySelector }: IContext
  ) {
    const selector = await generateFilter(
      subdomain,
      models,
      params,
      commonQuerySelector
    );

    return models.Works.find(selector).count();
  }
};

// checkPermission(workQueries, 'flows', 'showWorks');

export default workQueries;
