import { ICustomerDocument } from "../../models/definitions/customers";
import { es } from "../../configs";
import { client, sendConformityMessage } from "../../messageBroker";
import { IContext } from "../../connectionResolver";

export default {
  __resolveReference({ _id }, _params, { models: { Customers } }: IContext) {
    return Customers.findOne({ _id });
  },

  integration(customer: ICustomerDocument) {
    if (!customer.integrationId) { return null; }
    return { __typename: "Integration", _id: customer.integrationId };
  },

  async getTags(customer: ICustomerDocument) {
    return (customer.tagIds || []).map((_id) => ({ __typename: "Tag", _id }));
  },

  async urlVisits(customer: ICustomerDocument) {
    const response = await es.fetchElk({
      action: "search",
      index: "events",
      body: {
        _source: ["createdAt", "count", "attributes"],
        query: {
          bool: {
            must: [
              {
                term: { customerId: customer._id },
              },
              {
                term: { name: "viewPage" },
              },
            ],
          },
        },
      },
      defaultValue: { hits: { hits: [] } },
    });

    return response.hits.hits.map((hit) => {
      const source = hit._source;
      const firstAttribute = source.attributes[0] || {};

      return {
        createdAt: source.createdAt,
        count: source.count,
        url: firstAttribute.value,
      };
    });
  },

  async conversations(customer: ICustomerDocument) {
    return client.sendRPCMessage("inbox:rpc_queue:logs:getConversations", {
      query: { customerId: customer._id },
    });
  },

  async companies(
    customer: ICustomerDocument,
    _params,
    { models: { Companies } }: IContext
  ) {
    const companyIds = await sendConformityMessage("savedConformity", {
      mainType: "customer",
      mainTypeId: customer._id,
      relTypes: ["company"],
    });

    const companies = await Companies.find({
      _id: { $in: (companyIds || []).filter((id) => id) },
    }).limit(10);
    return companies;
  },

  async owner(customer: ICustomerDocument) {
    if (!customer.ownerId) {
      return;
    }

    return { __typename: "User", _id: customer.ownerId };
  },
};
