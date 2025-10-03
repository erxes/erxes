import { gql } from '@apollo/client';

export const uomQuery = gql`
  query uoms {
    uoms {
      _id
      name
      code
      createdAt
      isForSubscription
      subscriptionConfig
      __typename
    }
  }
`;
