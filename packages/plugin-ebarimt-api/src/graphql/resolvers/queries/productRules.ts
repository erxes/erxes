import { paginate } from "@erxes/api-utils/src";
import { IContext } from "../../../connectionResolver";

const generateFilter = async (subdomain, params, commonQuerySelector) => {
  const filter: any = commonQuerySelector;

  // if (params.productId) {}

  if (params.searchValue) {
    filter.title = {
      $regex: `.*${params.searchValue.trim()}.*`,
      $options: 'i',
    }
  }

  if (params.kind) {
    filter.kind = params.kind;
  }

  if (params.taxCode) {
    filter.taxCode = params.taxCode;
  }

  if (params.taxType) {
    filter.taxType = params.taxType;
  }

  return filter;
};

export const sortBuilder = params => {
  const { sortField, sortDirection = 0 } = params;

  if (sortField) {
    return { [sortField]: sortDirection };
  }

  return { createdAt: 1 };
};

const queries = {
  ebarimtProductRules: async (
    _root,
    params,
    { commonQuerySelector, models, subdomain }: IContext
  ) => {
    const filter = await generateFilter(subdomain, params, commonQuerySelector);

    return await paginate(
      models.ProductRules.find(filter).sort(sortBuilder(params) as any),
      {
        page: params.page || 1,
        perPage: params.perPage
      }
    );
  },

  ebarimtProductRulesCount: async (
    _root,
    params,
    { commonQuerySelector, models, subdomain }
  ) => {
    const filter = await generateFilter(subdomain, params, commonQuerySelector);

    return models.ProductRules.find(filter).countDocuments();
  },
};

export default queries;
