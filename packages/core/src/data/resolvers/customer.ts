import { sendInboxMessage } from "../../messageBroker";
import { IContext } from "../../connectionResolver";
import { fetchEs } from "@erxes/api-utils/src/elasticsearch";
import { customFieldsDataByFieldCode } from "@erxes/api-utils/src/fieldUtils";
import { ICustomerDocument } from "../../db/models/definitions/customers";

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    const customer = await models.Customers.findOne({ _id });
    return customer;
  },

  integration(customer: ICustomerDocument) {
    if (!customer.integrationId) {
      return null;
    }
    return { __typename: "Integration", _id: customer.integrationId };
  },

  async getTags(
    customer: ICustomerDocument,
    _args,
    { dataLoaders, subdomain }: IContext
  ) {
    const tags = await dataLoaders.tag.loadMany(customer.tagIds || []);

    return tags.filter(tag => tag);
  },

  async urlVisits(customer: ICustomerDocument, _args, { subdomain }: IContext) {
    const response = await fetchEs({
      subdomain,
      action: "search",
      index: "events",
      body: {
        _source: ["createdAt", "count", "attributes"],
        query: {
          bool: {
            must: [
              {
                term: { customerId: customer._id }
              },
              {
                term: { name: "viewPage" }
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
      action: "getConversations",
      data: { customerId: customer._id },
      isRPC: true,
      defaultValue: []
    });
  },

  async companies(
    customer: ICustomerDocument,
    _params,
    { models: { Companies, Conformities } }: IContext
  ) {
    const companyIds = await Conformities.savedConformity({
      mainType: "customer",
      mainTypeId: customer._id,
      relTypes: ["company"]
    });

    const companies = await Companies.find({
      _id: { $in: (companyIds || []).filter(id => id) }
    }).limit(10);
    return companies;
  },

  async owner(customer: ICustomerDocument, _, { models: { Users } }: IContext) {
    if (!customer.ownerId) {
      return;
    }

    return Users.findOne({ _id: customer.ownerId }) || {};
  },

  async customFieldsDataByFieldCode(
    company: ICustomerDocument,
    _,
    { subdomain }: IContext
  ) {
    return customFieldsDataByFieldCode(company, subdomain);
  }
};
