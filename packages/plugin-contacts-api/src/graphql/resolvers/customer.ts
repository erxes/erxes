import { ICustomerDocument } from '../../models/definitions/customers';
import {
  sendCoreMessage,
  sendInboxMessage,
  sendCommonMessage
} from '../../messageBroker';
import { IContext } from '../../connectionResolver';
import { fetchEs } from '@erxes/api-utils/src/elasticsearch';
import { customFieldsDataByFieldCode } from '@erxes/api-utils/src/fieldUtils';

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    const customer = await models.Customers.findOne({ _id });
    return customer;
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
      const { attributes } = source;
      const firstAttribute =
        (attributes && attributes.length > 0 && attributes[0]) || {};

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
  },

  customFieldsDataByFieldCode(
    company: ICustomerDocument,
    _,
    { subdomain }: IContext
  ) {
    return customFieldsDataByFieldCode(company, subdomain, sendCommonMessage);
  }
};
