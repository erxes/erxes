import { IProductDocument } from 'erxes-api-shared/core-types';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
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

  remainder: async (
    product: IProductDocument,
    _args: undefined,
    { subdomain }: IContext,
    info: any,
  ) => {
    const { branchId, departmentId, pipelineId } = info?.variableValues || {};
    let { branchIds, departmentIds } = info?.variableValues || {};

    if (branchId && departmentId) {
      const { remainder, cost, soonIn, soonOut } =
        product?.inventories?.[branchId]?.[departmentId] || {};
      return { remainder, cost, soonIn, soonOut };
    }

    if (pipelineId && !branchIds?.length && !departmentIds?.length) {
      const pipeline = await sendTRPCMessage({
        subdomain,
        pluginName: 'sales',
        module: 'pipeline',
        action: 'findOne',
        input: { query: { _id: pipelineId }, fields: { branchIds: 1, departmentIds: 1 } },
      });

      branchIds = pipeline?.branchIds;
      departmentIds = pipeline?.departmentIds
    }
    console.log(branchIds, departmentIds, 'ssssssss');

    const result = { remainder: 0, cost: 0, soonIn: 0, soonOut: 0 };

    for (const branchID of Object.keys(product.inventories || {})) {
      if (branchIds?.length && !branchIds.includes(branchID)) {
        continue
      }

      for (const departmentID of Object.keys(product.inventories?.[branchID] || {})) {
        if (departmentIds?.length && !departmentIds.includes(departmentID)) {
          continue
        }
        console.log(branchID, departmentID)
        const { remainder = 0, cost = 0, soonIn = 0, soonOut = 0 } = product.inventories?.[branchID]?.[departmentID] || {};
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
