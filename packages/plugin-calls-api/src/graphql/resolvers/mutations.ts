import { generateToken } from '../../utils';
import { IContext } from '../../connectionResolver';

import receiveCall from '../../receiveCall';

const callsMutations = {
  async callsIntegrationUpdate(_root, { configs }, { models }: IContext) {
    const { inboxId, ...data } = configs;
    const token = await generateToken(inboxId);

    const integration = await models.Integrations.findOneAndUpdate(
      { inboxId },
      { $set: { ...data, token } }
    );
    return integration;
  },

  async callAddCustomer(_root, args, { models, subdomain }: IContext) {
    const customer = await receiveCall(models, subdomain, args);
    let conversation;
    if (args.callID) {
      conversation = await models.Conversations.findOne({
        callId: args.callID
      });
    }

    return {
      customer: customer.erxesApiId && {
        __typename: 'Customer',
        _id: customer.erxesApiId
      },
      conversation
    };
  }
};

export default callsMutations;
