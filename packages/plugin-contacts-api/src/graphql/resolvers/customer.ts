import { ICustomerDocument } from '../../models/definitions/customers';
import { sendCoreMessage, sendInboxMessage } from '../../messageBroker';
import { IContext } from '../../connectionResolver';
import { fetchEs } from '@erxes/api-utils/src/elasticsearch';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Customers.findOne({ _id });
  },

  integration(customer: ICustomerDocument) {
    if (!customer.integrationId) {
      return null;
    }
    return { __typename: 'Integration', _id: customer.integrationId };
  },

  async getTags(customer: ICustomerDocument) {
    return (customer.tagIds || []).map(_id => ({ __typename: 'Tag', _id }));
  },

  async urlVisits(customer: ICustomerDocument, _args, { subdomain }: IContext) {
    const response = await fetchEs({
      subdomain,
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
    _args,
    { subdomain }: IContext
  ) {
    return sendInboxMessage({
      subdomain,
      action: 'getConversations',
      data: { customerId: customer._id },
      isRPC: true,
      defaultValue: []
    });
  },

  async companies(
    customer: ICustomerDocument,
    _params,
    { models: { Companies }, subdomain }: IContext
  ) {
    const companyIds = await sendCoreMessage({
      subdomain,
      action: 'conformities.savedConformity',
      data: {
        mainType: 'customer',
        mainTypeId: customer._id,
        relTypes: ['company']
      },
      isRPC: true,
      defaultValue: []
    });

    const companies = await Companies.find({
      _id: { $in: (companyIds || []).filter(id => id) }
    }).limit(10);
    return companies;
  },

  async owner(customer: ICustomerDocument) {
    if (!customer.ownerId) {
      return;
    }

    return { __typename: 'User', _id: customer.ownerId };
  }
};
