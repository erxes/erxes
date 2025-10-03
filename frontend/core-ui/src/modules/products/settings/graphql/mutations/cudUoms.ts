import { gql } from '@apollo/client';

export const UOMS_ADD = gql`
  mutation UomsAdd(
    $name: String
    $code: String
    $isForSubscription: Boolean
    $subscriptionConfig: JSON
    $timely: TimelyType
  ) {
    uomsAdd(
      name: $name
      code: $code
      isForSubscription: $isForSubscription
      subscriptionConfig: $subscriptionConfig
      timely: $timely
    ) {
      _id
    }
  }
`;

export const UOMS_EDIT = gql`
  mutation UomsEdit(
    $id: String!
    $name: String
    $code: String
    $isForSubscription: Boolean
    $subscriptionConfig: JSON
    $timely: TimelyType
  ) {
    uomsEdit(
      _id: $id
      name: $name
      code: $code
      isForSubscription: $isForSubscription
      subscriptionConfig: $subscriptionConfig
      timely: $timely
    ) {
      _id
    }
  }
`;

export const UOMS_REMOVE = gql`
  mutation UomsRemove($uomIds: [String!]) {
    uomsRemove(uomIds: $uomIds)
  }
`;
