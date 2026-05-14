import { IContext } from '~/connectionResolvers';

export const productRuleQueries = {
  async productRules(_root: undefined, _args: undefined, { models }: IContext) {
    return models.ProductRules.find().lean();
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
