import { gql } from '@apollo/client';

export const UOMS_ADD = gql`
  mutation UomsAdd($name: String, $code: String) {
    uomsAdd(name: $name, code: $code) {
      _id
      code
      name
      createdAt
    }
  }
`;
