import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { IProductRule } from '../../../models/definitions/productRule';

const productRuleMutations = {
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
