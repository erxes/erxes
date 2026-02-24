import { gql } from '@apollo/client';

export const pmsBranchAdd = gql`
  mutation pmsBranchAdd(
    $name: String
    $description: String
    $user1Ids: [String]
    $user2Ids: [String]
    $user3Ids: [String]
    $user4Ids: [String]
    $user5Ids: [String]
    $paymentIds: [String]
    $paymentTypes: [JSON]
    $departmentId: String
    $token: String
    $erxesAppToken: String
    $permissionConfig: JSON
    $uiOptions: JSON
    $pipelineConfig: JSON
    $extraProductCategories: JSON
    $roomCategories: JSON
    $time: String
    $discount: JSON
    $checkintime: String
    $checkouttime: String
    $checkinamount: Float
    $checkoutamount: Float
  ) {
    pmsBranchAdd(
      name: $name
      description: $description
      user1Ids: $user1Ids
      user2Ids: $user2Ids
      user3Ids: $user3Ids
      user4Ids: $user4Ids
      user5Ids: $user5Ids
      paymentIds: $paymentIds
      paymentTypes: $paymentTypes
      departmentId: $departmentId
      token: $token
      erxesAppToken: $erxesAppToken
      permissionConfig: $permissionConfig
      uiOptions: $uiOptions
      pipelineConfig: $pipelineConfig
      extraProductCategories: $extraProductCategories
      roomCategories: $roomCategories
      time: $time
      discount: $discount
      checkintime: $checkintime
      checkouttime: $checkouttime
      checkinamount: $checkinamount
      checkoutamount: $checkoutamount
    ) {
      _id
      createdAt
      userId
      name
      description
      erxesAppToken
      user1Ids
      user2Ids
      user3Ids
      user4Ids
      user5Ids
      paymentIds
      paymentTypes
      departmentId
      token
      permissionConfig
      uiOptions
      pipelineConfig
      extraProductCategories
      roomCategories
      time
      discount
      checkintime
      checkouttime
      checkinamount
      checkoutamount
    }
  }
`;

export const PmsBranchEdit = gql`
  mutation pmsBranchEdit(
    $_id: String!
    $name: String
    $description: String
    $erxesAppToken: String
    $user1Ids: [String]
    $user2Ids: [String]
    $user3Ids: [String]
    $user4Ids: [String]
    $user5Ids: [String]
    $paymentIds: [String]
    $paymentTypes: [JSON]
    $uiOptions: JSON
    $permissionConfig: JSON
    $pipelineConfig: JSON
    $extraProductCategories: JSON
    $roomCategories: JSON
    $discount: JSON
    $time: String
    $checkintime: String
    $checkouttime: String
    $checkinamount: Float
    $checkoutamount: Float
  ) {
    pmsBranchEdit(
      _id: $_id
      name: $name
      description: $description
      erxesAppToken: $erxesAppToken
      user1Ids: $user1Ids
      user2Ids: $user2Ids
      user3Ids: $user3Ids
      user4Ids: $user4Ids
      user5Ids: $user5Ids
      paymentIds: $paymentIds
      paymentTypes: $paymentTypes
      uiOptions: $uiOptions
      permissionConfig: $permissionConfig
      pipelineConfig: $pipelineConfig
      extraProductCategories: $extraProductCategories
      roomCategories: $roomCategories
      discount: $discount
      time: $time
      checkintime: $checkintime
      checkouttime: $checkouttime
      checkinamount: $checkinamount
      checkoutamount: $checkoutamount
    ) {
      _id
      name
      description
      createdAt
      token
      userId
      erxesAppToken
      user1Ids
      user2Ids
      user3Ids
      user4Ids
      user5Ids
      paymentIds
      paymentTypes
      user {
        _id
        details {
          avatar
          fullName
        }
      }
      uiOptions
      permissionConfig
      pipelineConfig
      extraProductCategories
      roomCategories
      discount
      time
      checkintime
      checkouttime
      checkinamount
      checkoutamount
    }
  }
`;

export const PmsBranchRemove = gql`
  mutation pmsBranchRemove($_id: String!) {
    pmsBranchRemove(_id: $_id)
  }
`;

export const pmsMutations = { PmsBranchRemove, pmsBranchAdd, PmsBranchEdit };
