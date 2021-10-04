import { Companies, Conformities } from '../../db/models';
import { ICustomerDocument } from '../../db/models/definitions/customers';
import { fetchElk } from '../../elasticsearch';
import { getDocument } from './mutations/cacheUtils';
import { IContext } from '../types';

export default {
  integration(customer: ICustomerDocument) {
    return getDocument('integrations', {
      _id: customer.integrationId
    });
  },

  getTags(customer: ICustomerDocument, _, { dataLoaders }: IContext) {
    return dataLoaders?.tag?.loadMany(customer.tagIds || []);
  },

  async urlVisits(customer: ICustomerDocument) {
    const response = await fetchElk({
      action: 'search',
      index: 'events',
      body: {
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
      defaultValue: { hits: { hits: [] } }
    });

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

  conversations(customer: ICustomerDocument, _, { dataLoaders } : IContext) {
    return dataLoaders?.conversationByCustomerId?.load(customer._id);
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
    return getDocument('users', { _id: customer.ownerId });
  }
};
