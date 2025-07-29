import { paginate } from "@erxes/api-utils/src";
import { IContext } from "../../../connectionResolver";
import { sendCoreMessage } from "../../../messageBroker";
import { escapeRegExp } from "@erxes/api-utils/src/core";

const generateFilter = async (subdomain, params, commonQuerySelector) => {
  const filter: any = commonQuerySelector;

  if (params.productId) {
    filter.$or = [
      { mainProductId: params.productId },
      { subProductId: params.productId }
    ]
  }

  if (params.searchValue) {
    const products = await sendCoreMessage({
      subdomain,
      action: 'products.find',
      data: {
        query: {
          $or: [
            {
              name: { $regex: `.*${escapeRegExp(params.searchValue)}.*` }
            },
            {
              code: { $regex: `.*${escapeRegExp(params.searchValue)}.*` }
            },
            {
              barcodes: { $regex: `.*${escapeRegExp(params.searchValue)}.*` }
            }
          ]
        }, fields: { _id: 1 }
      },
      isRPC: true,
      defaultValue: []
    });
    const productIds = products.map(p => p._id);

    filter.$or = [
      { mainProductId: { $in: productIds } },
      { subProductId: { $in: productIds } }
    ]
  }

  if (params.status) {
    if (params.status === 'active') {
      filter.isActive = true
    } else {
      filter.isActive = false
    }
  }

  return filter;
};

export const sortBuilder = params => {
  const { sortField, sortDirection = 0 } = params;

  if (sortField) {
    return { [sortField]: sortDirection };
  }

  return { sortNum: 1, createdAt: 1 };
};

const queries = {
  ebarimtProductGroups: async (
    _root,
    params,
    { commonQuerySelector, models, subdomain }: IContext
  ) => {
    const filter = await generateFilter(subdomain, params, commonQuerySelector);

    return await paginate(
      models.ProductGroups.find(filter).sort(sortBuilder(params) as any),
      {
        page: params.page || 1,
        perPage: params.perPage
      }
    );
  },

  ebarimtProductGroupsCount: async (
    _root,
    params,
    { commonQuerySelector, models, subdomain }
  ) => {
    const filter = await generateFilter(subdomain, params, commonQuerySelector);

    return models.ProductGroups.find(filter).countDocuments();
  },
};

export default queries;
