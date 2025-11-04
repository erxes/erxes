import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

const generateFilter = async (params) => {
  const filter: any = {};

  if (params.searchValue) {
    filter.title = {
      $regex: `.*${params.searchValue.trim()}.*`,
      $options: 'i',
    };
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

export const sortBuilder = (params) => {
  const { sortField, sortDirection = 0 } = params;

  if (sortField) {
    return { [sortField]: sortDirection };
  }

  return { createdAt: 1 };
};

export const productRuleQueries = {
  ebarimtProductRules: async (
    _root: undefined,
    params,
    { models }: IContext,
  ) => {
    const filter = await generateFilter(params);

    return await cursorPaginate({
      model: models.ProductRules,
      params: params,
      query: filter,
    });
  },

  ebarimtProductRulesCount: async (
    _root: undefined,
    params,
    { models }: IContext,
  ) => {
    const filter = await generateFilter(params);

    return models.ProductRules.find(filter).countDocuments();
  },
};
