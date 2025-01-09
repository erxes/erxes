import { customerFields } from '@erxes/ui-contacts/src/customers/graphql/queries';

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
      ${customerFields}
    }
  }
`;

export default {
  customerDetail,
  configs
};
