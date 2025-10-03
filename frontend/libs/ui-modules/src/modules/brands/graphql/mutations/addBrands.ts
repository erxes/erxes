import { gql } from '@apollo/client';

export const ADD_BRANDS = gql`
  mutation BrandsAdd($name: String!, $description: String) {
    brandsAdd(name: $name, description: $description) {
      _id
      name
      code
    }
  }
`;
