import { gql } from '@apollo/client';

export const GET_BRANCH_LIST = gql`
  query bmsBranchList($sortField: String, $sortDirection: Int) {
    bmsBranchList(sortField: $sortField, sortDirection: $sortDirection) {
      _id
      name
      description
      createdAt
      token
      erxesAppToken
      user1Ids
      user2Ids
      paymentIds
      paymentTypes
      user {
        _id
        details {
          avatar
          fullName
          __typename
        }
        __typename
      }
      uiOptions
      permissionConfig
      __typename
    }
  }
`;


