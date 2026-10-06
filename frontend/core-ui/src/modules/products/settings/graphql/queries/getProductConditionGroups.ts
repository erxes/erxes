import { gql } from '@apollo/client';

export const PRODUCT_CONDITION_GROUPS = gql`
  query productConditionGroups {
    productConditionGroups {
      _id
      name
      description
      conditions {
        _id
        name
      }
    }
  }
`;
