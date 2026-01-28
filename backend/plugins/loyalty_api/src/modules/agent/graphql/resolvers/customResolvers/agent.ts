import { IAgentDocument } from '@/agent/@types';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

export const Agent = {
  async rulesOfProducts(
    agent: IAgentDocument,
    _args: undefined,
    { subdomain }: IContext,
  ) {
    return sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'products',
      action: 'rules.find',
      input: { _ids: agent.productRuleIds },
    });
  },
};