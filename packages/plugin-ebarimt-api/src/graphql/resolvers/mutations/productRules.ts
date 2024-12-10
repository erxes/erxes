import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { IProductRule } from '../../../models/definitions/productRule';

const productRuleMutations = {
  async ebarimtProductRuleCreate(_root, doc: IProductRule, { models }: IContext) {
    return await models.ProductRules.createProductRule({ ...doc });
  },

  async ebarimtProductRuleUpdate(_root, { _id, ...doc }: { _id: string } & IProductRule, { models, subdomain }: IContext) {
    return await models.ProductRules.updateProductRule(_id, { ...doc });
  },
  async ebarimtProductRulesRemove(_root, { ids }: { ids: string[] }, { models, subdomain }: IContext) {
  }
};

checkPermission(productRuleMutations, 'putResponseReturnBill', 'specialReturnBill');
checkPermission(productRuleMutations, 'putResponseReReturn', 'reReturnBill');

export default productRuleMutations;
