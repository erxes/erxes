import { gql } from '@apollo/client';

const CATEGORY_ADD = gql`
  mutation InsuranceCategoryAdd(
    $name: String!
    $code: String!
    $description: String!
    $riskIds: [String]
  ) {
    insuranceCategoryAdd(
      name: $name
      code: $code
      description: $description
      riskIds: $riskIds
    ) {
      _id
      name
    }
  }
`;

const CATEGORY_EDIT = gql`
  mutation InsuranceCategoryEdit(
    $_id: ID!
    $name: String
    $code: String
    $description: String
    $riskIds: [String]
  ) {
    insuranceCategoryEdit(
      _id: $_id
      name: $name
      code: $code
      description: $description
      riskIds: $riskIds
    ) {
      _id
      name
    }
  }
`;

const CATEGORY_REMOVE = gql`
  mutation InsuranceCategoryRemove($_id: ID!) {
    insuranceCategoryRemove(_id: $_id)
  }
`;

export default {
  CATEGORY_ADD,
  CATEGORY_EDIT,
  CATEGORY_REMOVE
};
