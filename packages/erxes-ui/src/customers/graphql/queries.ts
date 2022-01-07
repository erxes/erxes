import {
  conformityQueryFieldDefs,
  conformityQueryFields
} from '@erxes/ui-cards/src/conformity/graphql/queries';

const basicFields = `
  _id
  firstName
  middleName
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
  isSubscribed
  code
  emailValidationStatus
  phoneValidationStatus
  score

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

export const customerFields = `
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

export default {
  basicFields,
  customerFields,
  listParamsDef,
  listParamsValue,
  customers
};
