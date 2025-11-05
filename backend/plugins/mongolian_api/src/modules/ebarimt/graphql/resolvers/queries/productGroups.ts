import {
  cursorPaginate,
  escapeRegExp,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

const generateFilter = async (subdomain, params) => {
  const filter: any = {};

  if (params.productId) {
    filter.$or = [
      { mainProductId: params.productId },
      { subProductId: params.productId },
    ];
  }

  if (params.searchValue) {
    const products = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'products',
      action: 'find',
      input: {
        query: {
          $or: [
            {
              name: { $regex: `.*${escapeRegExp(params.searchValue)}.*` },
            },
            {
              code: { $regex: `.*${escapeRegExp(params.searchValue)}.*` },
            },
            {
              barcodes: { $regex: `.*${escapeRegExp(params.searchValue)}.*` },
            },
          ],
        },
        fields: { _id: 1 },
      },
      defaultValue: [],
    });
    const productIds = products.map((p) => p._id);

    filter.$or = [
      { mainProductId: { $in: productIds } },
      { subProductId: { $in: productIds } },
    ];
  }

  if (params.status) {
    if (params.status === 'active') {
      filter.isActive = true;
    } else {
      filter.isActive = false;
    }
  }

  return filter;
};

export const productGroupQueries = {
  ebarimtProductGroups: async (
    _root: undefined,
    params,
    { models, subdomain }: IContext,
  ) => {
    const filter = await generateFilter(subdomain, params);

    return await cursorPaginate({
      model: models.ProductGroups,
      params: params,
      query: filter,
    });
  },

  ebarimtProductGroupsCount: async (
    _root: undefined,
    params,
    { models, subdomain }: IContext,
  ) => {
    const filter = await generateFilter(subdomain, params);

    return models.ProductGroups.find(filter).countDocuments();
  },
};
