import { escapeRegExp } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IProductRuleDocument } from '@/products/@types/rule';
import { IContext } from '~/connectionResolvers';

interface IProductRulesArgs {
  searchValue?: string;
  categoryIds?: string[];
  productIds?: string[];
}

const generateFilter = ({
  searchValue,
  categoryIds,
  productIds,
}: IProductRulesArgs) => {
  const filter: FilterQuery<IProductRuleDocument> = {};

  if (searchValue) {
    filter.name = new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i');
  }

  if (categoryIds?.length) {
    filter.categoryIds = { $in: categoryIds };
  }

  if (productIds?.length) {
    filter.productIds = { $in: productIds };
  }

  return filter;
};

export const productRuleQueries = {
  async productRules(
    _root: undefined,
    args: IProductRulesArgs,
    { models }: IContext,
  ) {
    return models.ProductRules.find(generateFilter(args)).lean();
  },

  async productRulesWithCount(
    _root: undefined,
    _args: undefined,
    { models }: IContext,
  ) {
    const rules = await models.ProductRules.find().lean();

    return {
      list: rules,
      totalCount: rules.length,
    };
  },
};
