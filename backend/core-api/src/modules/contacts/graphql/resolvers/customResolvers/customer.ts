import { ICustomerDocument } from 'erxes-api-shared/core-types';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

export default {
  __resolveReference: async ({ _id }, { models }: IContext) => {
    const customer = await models.Customers.findOne({ _id });
    return customer;
  },

  integration: (customer: ICustomerDocument) => {
    if (!customer.integrationId) {
      return null;
    }
    return { __typename: 'Integration', _id: customer.integrationId };
  },

  conversations: async (customer: ICustomerDocument) => {
    return await sendTRPCMessage({
      pluginName: 'frontline',
      method: 'query',
      module: 'inbox',
      action: 'getConversations',
      input: { query: { customerId: customer._id } },
      defaultValue: [],
    });
  },

  companies: async (
    customer: ICustomerDocument,
    _params: undefined,
    { models: { Companies, Conformities } }: IContext,
  ) => {
    const companyIds = await Conformities.savedConformity({
      mainType: 'customer',
      mainTypeId: customer._id,
      relTypes: ['company'],
    });

    return await Companies.find({
      _id: { $in: (companyIds || []).filter((id) => id) },
    }).limit(10);
  },

  owner: async (
    customer: ICustomerDocument,
    _params: undefined,
    { models: { Users } }: IContext,
  ) => {
    if (!customer.ownerId) {
      return;
    }

    return (await Users.findOne({ _id: customer.ownerId })) || {};
  },
};
