import { IContext } from "../../../connectionResolver";
import { sendCoreMessage } from "../../../messageBroker";
import { IAgentDocument } from "../../../models/definitions/agents";

export default {
  async rulesOfProducts(agent: IAgentDocument, _args, { subdomain }: IContext) {
    const rules = await sendCoreMessage({
      defaultValue: [],
      data: { _ids: agent.productRuleIds },
      action: 'productRules.find',
      subdomain,
      isRPC: true
    });

    return rules;
  }
};
