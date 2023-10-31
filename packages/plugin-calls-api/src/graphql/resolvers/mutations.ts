import { generateToken } from '../../utils';
import { IContext } from '../../connectionResolver';
import { ICustomer } from '../../models/definitions/customers';

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

  async callAddCustomer(
    _root,
    { primaryPhone, inboxIntegrationId },
    { models, subdomain }: IContext
  ) {
    const createData: ICustomer = {
      inboxIntegrationId,
      primaryPhone
    };

    const customer = await receiveCall(models, subdomain, createData);

    return (
      customer.erxesApiId && {
        __typename: 'Customer',
        _id: customer.erxesApiId
      }
    );
  }
};

export default callsMutations;
