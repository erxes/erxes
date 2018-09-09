import { Companies, Conversations, Deals, Integrations, Tags, Users } from '../../db/models';
import { ICustomerDocument } from '../../db/models/definitions/customers';

interface IMessengerCustomData {
  name: string;
  value: string;
}

export default {
  integration(customer: ICustomerDocument) {
    return Integrations.findOne({ _id: customer.integrationId });
  },

  getIntegrationData(customer: ICustomerDocument) {
    return {
      messenger: customer.messengerData || {},
      twitter: customer.twitterData || {},
      facebook: customer.facebookData || {},
    };
  },

  getMessengerCustomData(customer: ICustomerDocument) {
    const results: IMessengerCustomData[] = [];
    const messengerData: any = customer.messengerData || {};
    const data = messengerData.customData || {};

    Object.keys(data).forEach(key => {
      results.push({
        name: key.replace(/_/g, ' '),
        value: data[key],
      });
    });

    return results;
  },

  getTags(customer: ICustomerDocument) {
    return Tags.find({ _id: { $in: customer.tagIds || [] } });
  },

  conversations(customer: ICustomerDocument) {
    return Conversations.find({ customerId: customer._id });
  },

  companies(customer: ICustomerDocument) {
    return Companies.find({ _id: { $in: customer.companyIds || [] } });
  },

  owner(customer: ICustomerDocument) {
    return Users.findOne({ _id: customer.ownerId });
  },

  deals(customer: ICustomerDocument) {
    return Deals.find({ customerIds: { $in: [customer._id] } });
  },
};
