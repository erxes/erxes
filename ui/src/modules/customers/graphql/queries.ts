import {
  conformityQueryFieldDefs,
  conformityQueryFields
} from 'modules/conformity/graphql/queries';

const basicFields = `
  _id
  firstName
  lastName
  avatar
  sex
  birthDate
  primaryEmail
  emails
  primaryPhone
  phones

  state
  visitorContactInfo

  modifiedAt

  position
  department
  leadStatus
  hasAuthority
  description
  doNotDisturb
  code
  emailValidationStatus
  phoneValidationStatus

  isOnline
  lastSeenAt
  sessionCount

  links
  ownerId
  owner {
    _id
    details {
      fullName
    }
  }
`;

const customerFields = `
  ${basicFields}
  integrationId
  createdAt
  remoteAddress
  location

  customFieldsData
  trackedData

  tagIds
  getTags {
    _id
    name
    colorCode
  }
`;

const listParamsDef = `
  $page: Int,
  $perPage: Int,
  $segment: String,
  $tag: String,
  $type: String,
  $ids: [String],
  $excludeIds: Boolean,
  $searchValue: String,
  $autoCompletionType: String,
  $autoCompletion: Boolean,
  $brand: String,
  $integration: String,
  $form: String,
  $startDate: String,
  $endDate: String,
  $leadStatus: String,
  $sortField: String,
  $sortDirection: Int,
  ${conformityQueryFields}
`;

const listParamsValue = `
  page: $page,
  perPage: $perPage,
  segment: $segment,
  tag: $tag,
  type: $type,
  ids: $ids,
  excludeIds: $excludeIds,
  autoCompletionType: $autoCompletionType,
  autoCompletion: $autoCompletion,
  searchValue: $searchValue,
  brand: $brand,
  integration: $integration
  form: $form,
  startDate: $startDate,
  endDate: $endDate,
  leadStatus: $leadStatus,
  sortField: $sortField,
  sortDirection: $sortDirection,
  ${conformityQueryFieldDefs}
`;

const customers = `
  query customers(${listParamsDef}) {
    customers(${listParamsValue}) {
      ${customerFields}
    }
  }
`;

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
