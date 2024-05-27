import { gql } from '@apollo/client';

const RISKS_ADD = gql`
  mutation RisksAdd($name: String!, $code: String!, $description: String!) {
    risksAdd(name: $name, code: $code, description: $description) {
      _id
    }
  }
`;

const RISKS_EDIT = gql`
  mutation RisksEdit(
    $_id: ID!
    $name: String!
    $code: String!
    $description: String!
  ) {
    risksEdit(_id: $_id, name: $name, code: $code, description: $description) {
      _id
    }
  }
`;

const RISKS_REMOVE = gql`
  mutation RisksRemove($id: ID!) {
    risksRemove(_id: $id)
  }
`;

export default {
  RISKS_ADD,
  RISKS_EDIT,
  RISKS_REMOVE
};
