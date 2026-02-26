import { requireLogin, checkPermission } from "erxes-api-shared/core-modules";
import { IContext } from "~/connectionResolvers";
import { IRemaindersParams, IRemainderParams, IRemainderProductsParams } from "~/modules/inventories/@types/remainders";
import { getSafeRemainders } from "../utils/safeRemainders";
import { sendTRPCMessage } from "erxes-api-shared/utils";

const remainderQueries = {
  remainders: async (
    _root: any,
    params: IRemaindersParams,
    { models, subdomain }: IContext
  ) => {
    return await models.Remainders.getRemainders(subdomain, params);
  },

  remainderDetail: async (
    _root: any,
    { _id }: { _id: string },
    { models }: IContext
  ) => {
    return await models.Remainders.getRemainder(_id);
  },

  remainderCount: async (
    _root: any,
    params: IRemainderParams,
    { models, subdomain }: IContext
  ) => {
    return await models.Remainders.getRemainderCount(subdomain, params);
  },

  remainderProducts: async (
    _root: any,
    params: IRemainderProductsParams,
    { models, subdomain }: IContext
  ) => {
    return await models.Remainders.getRemainderProducts(subdomain, params);
  },

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
    { models, subdomain }: IContext
  ) => {
    const { categoryId, productIds, branchId, departmentId } = params;

    const productFilter: any = {};
    if (categoryId) {
      const productCategories = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'productCategories',
        action: "withChilds",
        input: {
          _ids: [categoryId]
        },
        defaultValue: []
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
      action: "find",
      input: { query: productFilter },
    });

    const beProductIds = products.map(p => p._id);
    const productById = {};

    for (const product of products) {
      productById[product._id] = product;
    }

    const branch = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'branches',
      action: "findOne",
      input: { query: { _id: branchId } },
    });

    const department = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'departments',
      action: "findOne",
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
      beProductIds
    );
    return result;
  }
};

requireLogin(remainderQueries, "remainders");
requireLogin(remainderQueries, "remainderCount");
requireLogin(remainderQueries, "remainderProducts");
checkPermission(remainderQueries, "remainderDetail", "manageRemainders", []);
checkPermission(remainderQueries, "remaindersLog", "manageRemainders", []);

export default remainderQueries;
