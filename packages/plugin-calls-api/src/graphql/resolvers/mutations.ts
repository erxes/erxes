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

  async callAddCustomer(_root, _args, { models, subdomain }: IContext) {
    const { primaryPhone, inboxIntegrationId, direction, callID } = _args;

    const customer = await receiveCall(models, subdomain, _args);

    return (
      customer.erxesApiId && {
        __typename: 'Customer',
        _id: customer.erxesApiId
      }
    );
  }
};

export default callsMutations;
