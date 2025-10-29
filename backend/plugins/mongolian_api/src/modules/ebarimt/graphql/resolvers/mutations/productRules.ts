import { IContext } from '~/connectionResolvers';
import { IProductRule } from '~/modules/ebarimt/@types';

export const productRuleMutations = {
  async ebarimtProductRuleCreate(
    _root: undefined,
    doc: IProductRule,
    { models }: IContext,
  ) {
    return await models.ProductRules.createProductRule({ ...doc });
  },

  async ebarimtProductRuleUpdate(
    _root: undefined,
    { _id, ...doc }: { _id: string } & IProductRule,
    { models }: IContext,
  ) {
    return await models.ProductRules.updateProductRule(_id, { ...doc });
  },
  async ebarimtProductRulesRemove(
    _root: undefined,
    { ids }: { ids: string[] },
    { models }: IContext,
  ) {
    return await models.ProductRules.removeProductRules(ids);
  },
};
