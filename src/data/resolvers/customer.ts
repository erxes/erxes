import { Companies, Conformities, Conversations, Integrations, Tags, Users } from '../../db/models';
import { ICustomerDocument } from '../../db/models/definitions/customers';

export default {
  integration(customer: ICustomerDocument) {
    return Integrations.findOne({ _id: customer.integrationId });
  },

  getTags(customer: ICustomerDocument) {
    return Tags.find({ _id: { $in: customer.tagIds || [] } });
  },

  conversations(customer: ICustomerDocument) {
    return Conversations.find({ customerId: customer._id });
  },

  async companies(customer: ICustomerDocument) {
    const companyIds = await Conformities.savedConformity({
      mainType: 'customer',
      mainTypeId: customer._id,
      relTypes: ['company'],
    });

    return Companies.find({ _id: { $in: companyIds || [] } });
  },

  owner(customer: ICustomerDocument) {
    return Users.findOne({ _id: customer.ownerId });
  },
};
