import { Conformities } from '../../db/models';
import { ICustomerDocument } from '../../db/models/definitions/customers';
import { fetchElk } from '../../elasticsearch';
import { IContext } from '../types';

export default {
  integration(customer: ICustomerDocument, _, { dataLoaders }: IContext) {
    return (
      (customer.integrationId &&
        dataLoaders.integration.load(customer.integrationId)) ||
      null
    );
  },

  async getTags(customer: ICustomerDocument, _, { dataLoaders }: IContext) {
    const tags = await dataLoaders.tag.loadMany(customer.tagIds || []);
    return tags.filter(tag => tag);
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

  async conversations(
    customer: ICustomerDocument,
    _,
    { dataLoaders }: IContext
  ) {
    const conversations = await dataLoaders.conversationsByCustomerId.load(
      customer._id
    );
    return conversations.filter(conversation => conversation);
  },

  async companies(customer: ICustomerDocument, _, { dataLoaders }: IContext) {
    const companyIds = await Conformities.savedConformity({
      mainType: 'customer',
      mainTypeId: customer._id,
      relTypes: ['company']
    });
    const companies = await dataLoaders.company.loadMany(
      (companyIds || []).filter(x => x)
    );
    return (companies || []).filter(c => c).slice(0, 10);
  },

  async owner(customer: ICustomerDocument, _, { dataLoaders }: IContext) {
    return (
      (customer.ownerId && dataLoaders.user.load(customer.ownerId)) || null
    );
  }
};
