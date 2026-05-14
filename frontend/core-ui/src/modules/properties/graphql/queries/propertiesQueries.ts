import { gql } from '@apollo/client';

export const PROPERTY_TYPES_QUERY = gql`
  query PropertyTypes {
    propertyTypes
  }
`;
