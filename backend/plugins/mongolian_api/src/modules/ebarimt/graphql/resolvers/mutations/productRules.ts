import { checkPermission } from 'erxes-api-shared/src/core-modules/permissions/utils';
import { IContext } from '~/connectionResolver';
import { IProductRule } from '@/ebarimt/db/definitions/productRule';

export const productRuleMutations = {
  async ebarimtProductRuleCreate(_root, doc: IProductRule, { models }: IContext) {
    return await models.ProductRules.createProductRule({ ...doc });
  },

  async ebarimtProductRuleUpdate(_root, { _id, ...doc }: { _id: string } & IProductRule, { models }: IContext) {
    return await models.ProductRules.updateProductRule(_id, { ...doc });
  },
  async ebarimtProductRulesRemove(_root, { ids }: { ids: string[] }, { models }: IContext) {
    return await models.ProductRules.removeProductRules(ids);
  }
};


checkPermission(productRuleMutations, 'ebarimtProductRuleCreate', 'syncEbarimtConfig');
checkPermission(productRuleMutations, 'ebarimtProductRuleUpdate', 'syncEbarimtConfig');
checkPermission(productRuleMutations, 'ebarimtProductRulesRemove', 'syncEbarimtConfig');

export default productRuleMutations;
