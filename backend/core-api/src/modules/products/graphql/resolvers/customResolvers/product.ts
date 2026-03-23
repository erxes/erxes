import { IProductDocument } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';
import { IProductParams } from '~/modules/products/@types';

export default {
  __resolveReference: async (
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.Products.findOne({ _id });
  },
  category: async (
    product: IProductDocument,
    _args: undefined,
    { models }: IContext,
  ) => {
    if (!product.categoryId) {
      return null;
    }

    return models.ProductCategories.findOne({ _id: product.categoryId });
  },
  vendor: async (
    product: IProductDocument,
    _args: undefined,
    { models }: IContext,
  ) => {
    if (!product.vendorId) {
      return null;
    }

    return models.Companies.findOne({ _id: product.vendorId });
  },

  remainder: async (product: IProductDocument, args: any, _c: IContext, info: any) => {
    const branchId = args.branchId || info?.variableValues?.branchId;
    const departmentId = args.departmentId || info?.variableValues?.departmentId;

    if (branchId && departmentId) {
      const { remainder, cost, soonIn, soonOut } = product?.inventories?.[branchId]?.[departmentId] || {};
      return { remainder, cost, soonIn, soonOut }
    }

    const result = { remainder: 0, cost: 0, soonIn: 0, soonOut: 0 };

    for (const branch of Object.values(product.inventories || {})) {
      for (const department of Object.values(branch)) {
        const { remainder = 0, cost = 0, soonIn = 0, soonOut = 0 } = department;
        result.remainder += remainder;
        result.cost += cost;
        result.soonIn += soonIn;
        result.soonOut += soonOut;
      }
    }
    return result;
  },

  discount: async (product: IProductDocument, args: IProductParams) => {
    if (args.branchId && args.departmentId) {
      return product.discounts?.[args.branchId]?.[args.departmentId];
    }
  },
};
