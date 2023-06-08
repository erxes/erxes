import { queries as customerQueries } from '@erxes/ui-contacts/src/customers/graphql';

// Settings

const configs = `
  query configs {
    configs {
      _id
      code
      value
    }
  }
`;

const customerDetail = `
  query customerDetail($_id: String!) {
    customerDetail(_id: $_id) {
      ${customerQueries.customerFields}
    }
  }
`;

export default {
  customerDetail,
  configs
};
