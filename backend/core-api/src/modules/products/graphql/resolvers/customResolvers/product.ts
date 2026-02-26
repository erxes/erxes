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

  remainder: async (product: IProductDocument, args: IProductParams) => {
    if (args.branchId && args.departmentId) {
      return product.remainders?.[args.branchId]?.[args.departmentId]
    }
    return;
  },

  discount: async (product: IProductDocument, args: IProductParams) => {
    if (args.branchId && args.departmentId) {
      return product.discounts?.[args.branchId]?.[args.departmentId]
    }
    return;
  }
};
