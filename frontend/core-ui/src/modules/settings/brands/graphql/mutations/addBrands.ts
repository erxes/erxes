import { gql } from '@apollo/client';

const ADD_BRANDS = gql`
  mutation BrandsAdd($name: String!, $description: String, $emailConfig: JSON) {
    brandsAdd(
      name: $name
      description: $description
      emailConfig: $emailConfig
    ) {
      _id
      code
      createdAt
      description
      emailConfig
      memberIds
      name
      userId
    }
  }
`;

export { ADD_BRANDS };
