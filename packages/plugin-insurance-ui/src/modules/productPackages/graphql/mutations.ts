import { gql } from '@apollo/client';

const ADD_PACKAGE = gql`
  mutation InsurancePackageAdd($input: InsurancePackageInput!) {
    insurancePackageAdd(input: $input) {
      _id
    }
  }
`;

const EDIT_PACKAGE = gql`
  mutation InsurancePackageEdit($input: InsurancePackageInput!, $_id: ID!) {
    insurancePackageEdit(input: $input, _id: $_id) {
      _id
    }
  }
`;

const REMOVE_PACKAGE = gql`
  mutation InsurancePackageRemove($_id: ID!) {
    insurancePackageRemove(_id: $_id)
  }
`;

export default { ADD_PACKAGE, EDIT_PACKAGE, REMOVE_PACKAGE };
