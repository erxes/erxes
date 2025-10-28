import { cursorPaginate } from '../../../../../../../../erxes-api-shared/src/utils';
import { IContext } from "../../../../../connectionResolver";

const generateFilter = async (params) => {
  const filter: any = {};

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

export const productRulesQueries = {
  ebarimtProductRules: async (
    _root,
    params,
    { models }: IContext
  ) => {
    const filter = await generateFilter(params);

    return await cursorPaginate({
      model: models.ProductRules,
      params,
      query: filter,
     
    });
  },

  ebarimtProductRulesCount: async (
    _root,
    params,
    { models }
  ) => {
    const filter = await generateFilter(params);

    return models.ProductRules.find(filter).countDocuments();
  },
};

export default productRulesQueries;