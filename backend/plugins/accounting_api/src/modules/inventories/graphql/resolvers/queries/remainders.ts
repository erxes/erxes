import { IContext } from '~/connectionResolvers';
import { getSafeRemainders } from '../utils/safeRemainders';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

const remainderQueries = {
  remaindersLog: async (
    _root: any,
    params: {
      categoryId: string;
      productIds: string[];
      branchId: string;
      departmentId: string;
      beginDate: Date;
      endDate: Date;
      isDetailed: boolean;
    },
    { models, subdomain }: IContext,
  ) => {
    const { categoryId, productIds, branchId, departmentId } = params;

    const productFilter: any = {};
    if (categoryId) {
      const productCategories = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'productCategories',
        action: 'withChilds',
        input: {
          _ids: [categoryId],
        },
        defaultValue: [],
      });
      const categoryIds = productCategories.map((item: any) => item._id);
      productFilter.categoryId = { $in: categoryIds };
    }
    if (productIds?.length) {
      productFilter._id = { $in: productIds };
    }

    const products = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'products',
      action: 'find',
      input: { query: productFilter },
    });

    const beProductIds = products.map((p) => p._id);
    const productById = {};

    for (const product of products) {
      productById[product._id] = product;
    }

    const branch = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'branches',
      action: 'findOne',
      input: { query: { _id: branchId } },
    });

    const department = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'departments',
      action: 'findOne',
      input: { query: { _id: departmentId } },
    });

    let result = {};

    result = await getSafeRemainders(
      models,
      params,
      result,
      branch,
      department,
      productById,
      beProductIds,
    );
    return result;
  },
};

export default remainderQueries;
