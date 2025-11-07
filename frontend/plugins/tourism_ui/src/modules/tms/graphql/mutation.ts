import { gql } from '@apollo/client';

export const CREATE_BRANCH = gql`
  mutation BmsBranchAdd(
    $name: String
    $generalManagerIds: [String]
    $managerIds: [String]
    $paymentIds: [String]
    $token: String
    $erxesAppToken: String
    $permissionConfig: JSON
    $uiOptions: JSON
  ) {
    bmsBranchAdd(
      name: $name
      generalManagerIds: $generalManagerIds
      managerIds: $managerIds
      paymentIds: $paymentIds
      token: $token
      erxesAppToken: $erxesAppToken
      permissionConfig: $permissionConfig
      uiOptions: $uiOptions
    ) {
      _id
    }
  }
`;

export const EDIT_BRANCH = gql`
  mutation BmsBranchEdit(
    $id: String
    $name: String
    $generalManagerIds: [String]
    $managerIds: [String]
    $paymentIds: [String]
    $token: String
    $erxesAppToken: String
    $permissionConfig: JSON
    $uiOptions: JSON
  ) {
    bmsBranchEdit(
      _id: $id
      name: $name
      generalManagerIds: $generalManagerIds
      managerIds: $managerIds
      paymentIds: $paymentIds
      token: $token
      erxesAppToken: $erxesAppToken
      permissionConfig: $permissionConfig
      uiOptions: $uiOptions
    ) {
      _id
    }
  }
`;

export const REMOVE_BRANCH = gql`
  mutation BmsBranchRemove($id: String!) {
    bmsBranchRemove(_id: $id)
  }
`;
