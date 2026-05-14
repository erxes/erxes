import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

const generateFilter = async (params) => {
  const filter: any = {};

  // Search
  if (params.searchValue) {
    filter.title = {
      $regex: `.*${params.searchValue.trim()}.*`,
      $options: 'i',
    };
  }

  // TAX rule filters
  if (params.kind) {
    filter.kind = params.kind;
  }

  if (params.taxCode) {
    filter.taxCode = params.taxCode;
  }

  if (params.taxType) {
    filter.taxType = params.taxType;
  }

  // v2.x parity
  if (params.taxPercent !== undefined && params.taxPercent !== null) {
    filter.taxPercent = params.taxPercent;
  }

  // Product-specific rule
  if (params.productId) {
    filter.productIds = params.productId;
  }

  return filter;
};

export const productRuleQueries = {
  ebarimtProductRules: async (
    _root: undefined,
    params,
    { models }: IContext,
  ) => {
    const filter = await generateFilter(params);

    // Default TAX sorting (v2.x style)
    if (!params.sortField) {
      params.sortField = 'createdAt';
      params.sortDirection = -1;
    }

    return cursorPaginate({
      model: models.ProductRules,
      params,
      query: filter,
    });
  },

  ebarimtProductRulesCount: async (
    _root: undefined,
    params,
    { models }: IContext,
  ) => {
    const filter = await generateFilter(params);
    return models.ProductRules.countDocuments(filter);
  },
};
