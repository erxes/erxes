import { gql } from '@apollo/client';

const vatRowInputParamsDefs = `
  $name: String
  $number: String
  $kind: String
  $formula: String
  $formulaText: String
  $tabCount: Float
  $isBold: Boolean
  $status: String
  $percent: Float
`;

const vatRowInputParams = `
  name: $name
  number: $number
  kind: $kind
  formula: $formula
  formulaText: $formulaText
  tabCount: $tabCount
  isBold: $isBold
  status: $status
  percent: $percent
`;

export const EBARIMT_ADD = gql`
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

export const EBARIMT_EDIT = gql`
  mutation ebarimtEdit($_id: String!${vatRowInputParamsDefs}) {
    ebarimtEdit(_id: $_id, ${vatRowInputParams}) {
      _id
      title
      number
      kind
      formula
      formulaText
      tabCount
      isBold
      status
      percent
    }
  }
`;

export const GROUP_PRODUCT_REMOVE = gql`
  mutation ebarimtProductGroupsRemove($ids: [String]) {
    ebarimtProductGroupsRemove(ids: $ids)
  }
`;
