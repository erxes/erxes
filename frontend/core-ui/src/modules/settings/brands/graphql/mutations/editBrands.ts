import { gql } from '@apollo/client';

const EDIT_BRANDS = gql`
  mutation BrandsEdit(
    $id: String!
    $name: String!
    $description: String
    $emailConfig: JSON
  ) {
    brandsEdit(
      _id: $id
      name: $name
      description: $description
      emailConfig: $emailConfig
    ) {
      _id
      name
      description
      code
      userId
      createdAt
      emailConfig
      memberIds
    }
  }
`;

export { EDIT_BRANDS };
