import { gql } from '@apollo/client';

export const CREATE_BRANCH = gql`
  mutation BmsBranchAdd(
    $name: String
    $description: String
    $generalManagerIds: [String]
    $managerIds: [String]
    $paymentIds: [String]
    $paymentTypes: [JSON]
    $departmentId: String
    $token: String
    $erxesAppToken: String
    $permissionConfig: JSON
    $uiOptions: JSON
  ) {
    bmsBranchAdd(
      name: $name
      description: $description
      generalManagerIds: $generalManagerIds
      managerIds: $managerIds
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
        username
        email
        details {
          avatar
          fullName
          shortName
        }
      }
      name
      description
      generalManagerIds
      managerIds
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

export const EDIT_BRANCH = gql`
  mutation BmsBranchEdit(
    $id: String
    $name: String
    $description: String
    $generalManagerIds: [String]
    $managerIds: [String]
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
      generalManagerIds: $generalManagerIds
      managerIds: $managerIds
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
        username
        email
        details {
          avatar
          fullName
          shortName
        }
      }
      name
      description
      generalManagerIds
      managerIds
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
