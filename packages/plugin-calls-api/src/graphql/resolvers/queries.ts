import { IContext } from '../../connectionResolver';
import { sendCommonMessage } from '../../messageBroker';

const callsQueries = {
  callsIntegrationDetail(_root, { integrationId }, { models }: IContext) {
    return models.Integrations.findOne({ inboxId: integrationId });
  },

  async callIntegrationsOfUser(_root, _args, { models, user }: IContext) {
    const res = models.Integrations.getIntegrations(user._id);

    return res;
  },

  async callsCustomerDetail(_root, { callerNumber }, { subdomain }: IContext) {
    let customer = await sendCommonMessage({
      subdomain,
      isRPC: true,
      serviceName: 'contacts',
      action: 'customers.findOne',
      data: {
        primaryPhone: callerNumber
      },
      defaultValue: null
    });

    return customer;
  }
};

export default callsQueries;
