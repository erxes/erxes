import { gql } from '@apollo/client';

const PRODUCTS_ADD = gql`
  mutation InsuranceProductsAdd(
    $name: String!
    $code: String!
    $description: String!
    $price: Float!
    $riskConfigs: [RiskConfigInput]
    $categoryId: ID!
    $companyProductConfigs: [CompanyProductConfigInput]
    $customFieldsData: JSON
  ) {
    insuranceProductsAdd(
      name: $name
      code: $code
      description: $description
      price: $price
      riskConfigs: $riskConfigs
      companyProductConfigs: $companyProductConfigs
      categoryId: $categoryId
      customFieldsData: $customFieldsData
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
    $riskConfigs: [RiskConfigInput]
    $categoryId: ID
    $companyProductConfigs: [CompanyProductConfigInput]
    $customFieldsData: JSON
  ) {
    insuranceProductsEdit(
      _id: $_id
      name: $name
      code: $code
      description: $description
      price: $price
      riskConfigs: $riskConfigs
      categoryId: $categoryId
      companyProductConfigs: $companyProductConfigs
      customFieldsData: $customFieldsData
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
