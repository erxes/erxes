import { queries as customerQueries } from 'erxes-ui/lib/customers/graphql';

const basicFields = customerQueries.basicFields;

const customerFields = customerQueries.customerFields;

const listParamsDef = customerQueries.listParamsDef;

const listParamsValue = customerQueries.listParamsValue;

const customers = customerQueries.customers;

const customersMain = `
  query customersMain(${listParamsDef}) {
    customersMain(${listParamsValue}) {
      list {
        ${customerFields}
      }

      totalCount
    }
  }
`;

const customersExport = `
  query customersExport(${listParamsDef}) {
    customersExport(${listParamsValue})
  }
`;

const customerCounts = `
  query customerCounts(${listParamsDef}, $only: String) {
    customerCounts(${listParamsValue}, only: $only)
  }
`;

const customerDetail = `
  query customerDetail($_id: String!) {
    customerDetail(_id: $_id) {
      ${customerFields}
      urlVisits
      integration {
        kind
        name
        isActive
      }
      companies {
        _id
        primaryName
        website
      }
      conversations {
        _id
        content
        createdAt
        assignedUser {
          _id
          details {
            avatar
          }
        }
        integration {
          _id
          kind
          brandId,
          brand {
            _id
            name
          }
          channels {
            _id
            name
          }
        }
        customer {
          _id
          firstName
          lastName
          primaryEmail
          primaryPhone
        }
        tags {
          _id
          name
          colorCode
        }
        readUserIds
      }
    }
  }
`;

const customersListConfig = `
  query {
    fieldsDefaultColumnsConfig(contentType: "customer") {
      name
      label
      order
    }
  }
`;

export default {
  basicFields,
  customers,
  customersMain,
  customerCounts,
  customerDetail,
  customersListConfig,
  customersExport
};
