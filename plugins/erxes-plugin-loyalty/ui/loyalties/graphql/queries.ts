import { queries as customerQueries } from 'erxes-ui/lib/customers/graphql';

const customerLoyaltyFields = `
  customerId
  loyalty
`;

const customerLoyaltiesFields = `
  modifiedAt
  customerId
  value
  dealId
  userId

  user {
    _id
    email
    details {
      fullName
      avatar
    }
  }

  deal {
    _id
    name
    stageId
    boardId
    stage {
      probability
    }
  }
`;

const listParamsDef = `
  $page: Int
  $perPage: Int
  $customerId: String!
`;

const listParamsValue = `
  page: $page
  perPage: $perPage
  customerId: $customerId
`;

export const customerLoyalties = `
  query customerLoyalties(${listParamsDef}) {
    customerLoyalties(${listParamsValue}) {
      ${customerLoyaltiesFields}
    }
  }
`;

export const customerLoyalty = `
  query customerLoyalty($customerId: String!) {
    customerLoyalty(customerId: $customerId) {
      ${customerLoyaltyFields}
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
  customerLoyalty,
  customerLoyalties,
  customerDetail,
};
