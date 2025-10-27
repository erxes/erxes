import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from "../../../connectionResolver";
import { escapeRegExp } from 'erxes-api-shared/utils';
import { sendTRPCMessage } from 'erxes-api-shared/src/utils/trpc';

const generateFilter = async (params, commonQuerySelector) => {
  const filter: any = { ...commonQuerySelector };

  // Filter by productId — either as main or sub product
  if (params.productId) {
    filter.$or = [
      { mainProductId: params.productId },
      { subProductId: params.productId },
    ];
  }

  // Filter by search value (product name, code, or barcode)
  if (params.searchValue) {
    const products = await sendTRPCMessage("core.products.find", {
      query: {
        $or: [
          {
            name: {
              $regex: `.*${escapeRegExp(params.searchValue)}.*`,
              $options: "i",
            },
          },
          {
            code: {
              $regex: `.*${escapeRegExp(params.searchValue)}.*`,
              $options: "i",
            },
          },
          {
            barcodes: {
              $regex: `.*${escapeRegExp(params.searchValue)}.*`,
              $options: "i",
            },
          },
        ],
      },
      fields: { _id: 1 },
    });

    const productIds = products.map((p) => p._id);

    filter.$or = [
      { mainProductId: { $in: productIds } },
      { subProductId: { $in: productIds } },
    ];
  }

  // Filter by active/inactive status
  if (params.status) {
    filter.isActive = params.status === "active";
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

const queries = {
  // cursorPaginated list of product groups
  ebarimtProductGroups: async (
    _root,
    params,
    { models }: IContext
  ) => {
    const filter = await generateFilter(params);

    return await cursorPaginate(
      models.ProductGroups.find(filter).sort(sortBuilder(params) as any),
      {
        page: params.page || 1,
        perPage: params.perPage,
      }
    );
  },

  // Count query for product groups
  ebarimtProductGroupsCount: async (
    _root,
    params,
    { models }: IContext
  ) => {
    const filter = await generateFilter(params);
    return models.ProductGroups.countDocuments(filter);
  },
};

export default queries;
