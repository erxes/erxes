import { gql } from '@apollo/client';

export const CREATE_BRANCH_BRANCH = gql`
  mutation bmsBranchAdd(
    $name: String
    $description: String
    $erxesAppToken: String
    $user1Ids: [String]
    $user2Ids: [String]
    $paymentIds: [String]
    $paymentTypes: [JSON]
    $uiOptions: JSON
    $permissionConfig: JSON
  ) {
    bmsBranchAdd(
      name: $name
      description: $description
      erxesAppToken: $erxesAppToken
      user1Ids: $user1Ids
      user2Ids: $user2Ids
      paymentIds: $paymentIds
      paymentTypes: $paymentTypes
      uiOptions: $uiOptions
      permissionConfig: $permissionConfig
    ) {
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

export const EDIT_BRANCH_LIST = gql`
  mutation BmsBranchEdit(
    $id: String
    $name: String
    $description: String
    $user1Ids: [String]
    $user2Ids: [String]
    $paymentIds: [String]
    $paymentTypes: [JSON]
    $departmentId: String
    $token: String
    $erxesAppToken: String
    $permissionConfig: JSON
    $uiOptions: JSON
  ) {
    bmsBranchEdit(
      _id: $id
      name: $name
      description: $description
      user1Ids: $user1Ids
      user2Ids: $user2Ids
      paymentIds: $paymentIds
      paymentTypes: $paymentTypes
      departmentId: $departmentId
      token: $token
      erxesAppToken: $erxesAppToken
      permissionConfig: $permissionConfig
      uiOptions: $uiOptions
    ) {
      _id
      createdAt
      userId
      user {
        _id
        details {
          avatar
          fullName
          __typename
        }
        __typename
      }
      name
      description
      user1Ids
      user2Ids
      paymentIds
      paymentTypes
      departmentId
      token
      erxesAppToken
      permissionConfig
      uiOptions
    }
  }
`;

export const REMOVE_BRANCH = gql`
  mutation BmsBranchRemove($id: String!) {
    bmsBranchRemove(_id: $id)
  }
`;
