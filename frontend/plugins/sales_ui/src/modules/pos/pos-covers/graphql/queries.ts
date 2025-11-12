import { gql } from '@apollo/client';

export const posCoversCommonFields = `
  _id
  posToken
  status
  beginDate
  endDate
  description
  userId
  details {
    _id
    paidType
    paidSummary {
      _id
      kind
      kindOfVal
      value
      amount
      __typename
    }
    paidDetail
    __typename
  }
  createdAt
  createdBy
  modifiedAt
  modifiedBy
  note
  posName
  createdUser {
    _id
    email
    __typename
  }
  modifiedUser {
    _id
    email
    __typename
  }
  __typename
`;
export const posCovers = gql`
  query posCovers(
    $page: Int
    $perPage: Int
    $sortField: String
    $sortDirection: Int
    $posId: String
    $posToken: String
    $startDate: Date
    $endDate: Date
    $userId: String
  ) {
    posCovers(
      page: $page
      perPage: $perPage
      sortField: $sortField
      sortDirection: $sortDirection
      posId: $posId
      posToken: $posToken
      startDate: $startDate
      endDate: $endDate
      userId: $userId
    ) {
      ${posCoversCommonFields}
    }
  }
`;
const commonParamDefs = `
  $page: Int,
  $perPage: Int
`;

const commonParams = `
  page: $page,
  perPage: $perPage
`;

const posCoversList = gql`
  query posCoversList(
    ${commonParamDefs}
    $sortField: String
    $sortDirection: Int
  ) {
    posCoversList(
      ${commonParams}
      sortField: $sortField
      sortDirection: $sortDirection
    ) {
      ${posCoversCommonFields}
    }
  }
`;

export default {
  posCovers,
  posCoversList,
};
