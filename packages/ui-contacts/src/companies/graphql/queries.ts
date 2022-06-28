import {
  conformityQueryFieldDefs,
  conformityQueryFields
} from '@erxes/ui-cards/src/conformity/graphql/queries';

import { isEnabled } from '@erxes/ui/src/utils/core';

export const companyFields = `
  _id
  createdAt
  modifiedAt
  avatar
  primaryName
  names
  size
  industry
  plan
  location

  parentCompanyId
  emails
  primaryEmail
  ownerId
  phones
  primaryPhone
  businessType
  description
  isSubscribed
  code
  links
  owner {
    _id
    details {
      fullName
    }
  }
  parentCompany {
    _id
    primaryName
  }

  customFieldsData
  trackedData
  tagIds
  ${
    isEnabled('tags')
      ? `
    getTags {
      _id
      name
      colorCode
    }
  `
      : ``
  }
  score
`;

const listParamsDef = `
  $page: Int
  $perPage: Int
  $segment: String
  $tag: String
  $ids: [String]
  $excludeIds: Boolean
  $searchValue: String
  $autoCompletion: Boolean
  $autoCompletionType: String
  $brand: String
  $sortField: String
  $sortDirection: Int
  ${conformityQueryFields}
`;

const listParamsValue = `
  page: $page
  perPage: $perPage
  segment: $segment
  tag: $tag
  ids: $ids
  excludeIds: $excludeIds
  searchValue: $searchValue
  autoCompletion: $autoCompletion
  autoCompletionType: $autoCompletionType
  brand: $brand
  sortField: $sortField
  sortDirection: $sortDirection
  ${conformityQueryFieldDefs}
`;

export const companies = `
  query companies(${listParamsDef}) {
    companies(${listParamsValue}) {
      ${companyFields}
    }
  }
`;

export default {
  companyFields,
  listParamsDef,
  listParamsValue,
  companies
};
