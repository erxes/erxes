import { gql } from '@apollo/client';

export const EBARIMT_PRODUCT_GROUP_ADD = gql`
  mutation ebarimtProductGroupCreate(
    $mainProductId: String
    $subProductId: String
    $sortNum: Float
    $ratio: Float
    $isActive: Boolean
  ) {
    ebarimtProductGroupCreate(
      mainProductId: $mainProductId
      subProductId: $subProductId
      sortNum: $sortNum
      ratio: $ratio
      isActive: $isActive
    ) {
      _id
      createdAt
      modifiedAt
      modifiedBy
      mainProductId
      subProductId
      sortNum
      ratio
      isActive
      mainProduct {
        _id
        code
        name
        __typename
      }
      subProduct {
        _id
        code
        name
        __typename
      }
      modifiedUser {
        _id
        email
        __typename
      }
      __typename
    }
  }
`;

export const EBARIMT_PRODUCT_GROUP_EDIT = gql`
  mutation ebarimtProductGroupUpdate(
    $_id: String!
    $mainProductId: String
    $subProductId: String
    $sortNum: Float
    $ratio: Float
    $isActive: Boolean
  ) {
    ebarimtProductGroupUpdate(
      _id: $_id
      mainProductId: $mainProductId
      subProductId: $subProductId
      sortNum: $sortNum
      ratio: $ratio
      isActive: $isActive
    ) {
      _id
      createdAt
      modifiedAt
      modifiedBy
      mainProductId
      subProductId
      sortNum
      ratio
      isActive
      mainProduct {
        _id
        code
        name
        __typename
      }
      subProduct {
        _id
        code
        name
        __typename
      }
      modifiedUser {
        _id
        email
        __typename
      }
      __typename
    }
  }
`;

export const EBARIMT_PRODUCT_GROUP_REMOVE = gql`
  mutation EbarimtProductGroupsRemove($ids: [String!]) {
    ebarimtProductGroupsRemove(ids: $ids)
  }
`;
