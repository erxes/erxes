import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { IAgentDocument } from '~/modules/loyalty/@types/agents';

export default {
  async rulesOfProducts(agent: IAgentDocument, _args, { subdomain }: IContext) {
    const rules = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'product',
      defaultValue: [],
      input: { _ids: agent.productRuleIds },
      action: 'productRules.find',
    });

    return rules;
  },
};
