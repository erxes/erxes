import { cursorPaginate } from 'erxes-api-shared/utils';
import { escapeRegExp } from 'erxes-api-shared/utils';
import { sendTRPCMessage } from 'erxes-api-shared/src/utils/trpc';
import { IContext } from '~/connectionResolver';
import { FilterQuery } from 'mongoose';
import {
  IProductGroup,
  IProductGroupDocument,
} from '~/modules/ebarimt/db/definitions/productGroup';
import { IProductGroupParams } from '~/modules/ebarimt/@types';

const generateFilter = async (
  params: IProductGroupParams,
  subdomain: string,
) => {
  const filter: FilterQuery<IProductGroupDocument> = {};

  // Filter by productId — either as main or sub product
  if (params.productId) {
    filter.$or = [
      { mainProductId: params.productId },
      { subProductId: params.productId },
    ];
  }

  // Filter by search value (product name, code, or barcode)
  if (params.searchValue) {
    const products = await sendTRPCMessage({
      subdomain: subdomain,
      pluginName: 'core',
      module: 'products',
      action: 'find',
      method: 'query',
      input: {
        query: {
          $or: [
            {
              name: {
                $regex: `.*${escapeRegExp(params.searchValue)}.*`,
                $options: 'i',
              },
            },
            {
              code: {
                $regex: `.*${escapeRegExp(params.searchValue)}.*`,
                $options: 'i',
              },
            },
            {
              barcodes: {
                $regex: `.*${escapeRegExp(params.searchValue)}.*`,
                $options: 'i',
              },
            },
          ],
        },
        fields: { _id: 1 },
      },
      defaultValue: [],
      options: {},
    });

    const productIds = products.map((p) => p._id);

    filter.$or = [
      { mainProductId: { $in: productIds } },
      { subProductId: { $in: productIds } },
    ];
  }

  // Filter by active/inactive status
  if (params.status) {
    filter.isActive = params.status === 'active';
  }

  return filter;
};

// Sorting builder
export const sortBuilder = (params) => {
  const { sortField, sortDirection = 0 } = params;
  if (sortField) {
    return { [sortField]: sortDirection };
  }
  return { sortNum: 1, createdAt: 1 };
};

export const productGroupQueries = {
  // Cursor-paginated list of product groups
  ebarimtProductGroups: async (
    _root,
    params: IProductGroupParams,
    { models, subdomain }: IContext,
  ) => {
    const filter = await generateFilter(params, subdomain);

    return await cursorPaginate({
      model: models.ProductGroups,
      params,
      query: filter,
    });
  },

  // Count query for product groups
  ebarimtProductGroupsCount: async (
    _root,
    params,
    { models, subdomain }: IContext,
  ) => {
    const filter = await generateFilter(params, subdomain);
    return models.ProductGroups.countDocuments(filter);
  },
};

export default productGroupQueries;
