import { gql } from '@apollo/client';

export const UOMS = gql`
  query Uoms {
    uoms {
      _id
      name
      code
      createdAt
      isForSubscription
      subscriptionConfig
      timely
    }
  }
`;
