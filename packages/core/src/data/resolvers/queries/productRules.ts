import { IContext } from "../../../connectionResolver";

const productRuleQueries = {
  async productRules(_root, _params, { models }: IContext) {
    return models.ProductRules.find().lean();
  },
  async productRulesWithCount(_root, _params, { models }: IContext) {
    const rules = await models.ProductRules.find().lean();

    return {
      list: rules,
      totalCount: rules.length
    };
  }
};

export default productRuleQueries;
