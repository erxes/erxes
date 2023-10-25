import { gql } from '@apollo/client';

const PRODUCTS_ADD = gql`
  mutation InsuranceProductsAdd(
    $name: String!
    $code: String!
    $description: String!
    $price: Float!
    $riskIds: [ID]
    $companyProductConfigs: [CompanyProductConfigInput]
  ) {
    insuranceProductsAdd(
      name: $name
      code: $code
      description: $description
      price: $price
      riskIds: $riskIds
      companyProductConfigs: $companyProductConfigs
    ) {
      _id
    }
  }
`;

const PRODUCTS_EDIT = gql`
  mutation InsuranceProductsEdit(
    $_id: ID!
    $name: String
    $code: String
    $description: String
    $price: Float
    $riskIds: [ID]
    $companyProductConfigs: [CompanyProductConfigInput]
  ) {
    insuranceProductsEdit(
      _id: $_id
      name: $name
      code: $code
      description: $description
      price: $price
      riskIds: $riskIds
      companyProductConfigs: $companyProductConfigs
    ) {
      _id
    }
  }
`;

const PRODUCTS_REMOVE = gql`
  mutation InsuranceProductsRemove($id: ID!) {
    insuranceProductsRemove(_id: $id)
  }
`;

export default {
  PRODUCTS_ADD,
  PRODUCTS_EDIT,
  PRODUCTS_REMOVE
};
