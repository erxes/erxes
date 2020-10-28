import {
  Companies,
  Conformities,
  Conversations,
  Integrations,
  Tags,
  Users
} from '../../db/models';
import { ICustomerDocument } from '../../db/models/definitions/customers';
import { fetchElk } from '../../elasticsearch';

export default {
  integration(customer: ICustomerDocument) {
    return Integrations.findOne({ _id: customer.integrationId });
  },

  getTags(customer: ICustomerDocument) {
    return Tags.find({ _id: { $in: customer.tagIds || [] } });
  },

  async urlVisits(customer: ICustomerDocument) {
    const response = await fetchElk(
      'search',
      'events',
      {
        _source: ['createdAt', 'count', 'attributes'],
        query: {
          bool: {
            must: [
              {
                term: { customerId: customer._id }
              },
              {
                term: { name: 'viewPage' }
              }
            ]
          }
        }
      },
      '',
      { hits: { hits: [] } }
    );

    return response.hits.hits.map(hit => {
      const source = hit._source;
      const firstAttribute = source.attributes[0] || {};

      return {
        createdAt: source.createdAt,
        count: source.count,
        url: firstAttribute.value
      };
    });
  },

  conversations(customer: ICustomerDocument) {
    return Conversations.find({ customerId: customer._id });
  },

  async companies(customer: ICustomerDocument) {
    const companyIds = await Conformities.savedConformity({
      mainType: 'customer',
      mainTypeId: customer._id,
      relTypes: ['company']
    });

    return Companies.find({ _id: { $in: companyIds || [] } }).limit(10);
  },

  owner(customer: ICustomerDocument) {
    return Users.findOne({ _id: customer.ownerId });
  }
};
