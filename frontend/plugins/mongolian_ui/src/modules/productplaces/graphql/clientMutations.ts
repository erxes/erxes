import { gql } from '@apollo/client';

export const MN_CONFIGS_CREATE = gql`
  mutation MnConfigsCreate(
    $code: String!
    $subId: String
    $value: JSON
  ) {
    mnConfigsCreate(
      code: $code
      subId: $subId
      value: $value
    ) {
      _id
      code
      subId
      value
    }
  }
`;

export const MN_CONFIGS_UPDATE = gql`
  mutation MnConfigsUpdate(
    $_id: String!
    $subId: String
    $value: JSON
  ) {
    mnConfigsUpdate(
      _id: $_id
      subId: $subId
      value: $value
    ) {
      _id
      code
      subId
      value
    }
  }
`;

export const MN_CONFIGS_REMOVE = gql`
  mutation MnConfigsRemove($_id: String!) {
    mnConfigsRemove(_id: $_id)
  }
`;
