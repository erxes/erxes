import { gql } from '@apollo/client';

export const paymentConfigs = gql`
  query paymentConfigs {
    paymentConfigs {
      _id
      name
      type
    }
  }
`;
