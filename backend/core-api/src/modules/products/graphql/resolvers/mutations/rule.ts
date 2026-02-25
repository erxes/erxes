import { IProductRule, IProductRuleDocument } from '@/products/@types/rule';
import { IContext } from '~/connectionResolvers';

export const productRuleMutations = {
  async productRulesAdd(
    _root: undefined,
    params: IProductRule,
    { models }: IContext,
  ) {
    return models.ProductRules.createRule(params);
  },

  async productRulesEdit(
    _root: undefined,
    { _id, ...doc }: IProductRuleDocument,
    { models }: IContext,
  ) {
    return models.ProductRules.updateRule(_id, doc);
  },

  async productRulesRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models }: IContext,
  ) {
    return models.ProductRules.removeRule(_ids);
  },
};
