import { moduleRequireLogin } from "@erxes/api-utils/src/permissions";
import { IContext } from "../../../connectionResolver";
import { IProductRule, IProductRuleDocument } from "../../../db/models/definitions/productRules";

const productRuleMutations = {
  async productRulesAdd(_root, params: IProductRule, { models }: IContext) {
    const rule = await models.ProductRules.createRule(params);

    return rule;
  },
  async productRulesEdit(_root, params: IProductRuleDocument, { models }: IContext) {
    const rule = await models.ProductRules.getRule(params._id);
    const updated =  models.ProductRules.updateRule(rule._id, params);

    return updated;
  },
  async productRulesRemove(_root, params: { _id: string }, { models }: IContext) {
    const rule = await models.ProductRules.getRule(params._id);

    return models.ProductRules.removeRule(rule._id);
  }
};

moduleRequireLogin(productRuleMutations);

export default productRuleMutations;
