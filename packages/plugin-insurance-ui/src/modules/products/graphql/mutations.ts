import { gql } from '@apollo/client';

const PRODUCTS_ADD = gql`
  mutation InsuranceProductsAdd(
    $name: String!
    $code: String!
    $description: String!
    $price: Float
    $riskConfigs: [RiskConfigInput]
    $categoryId: ID!
    $companyProductConfigs: [CompanyProductConfigInput]
    $customFieldsData: JSON
    $travelProductConfigs: [TravelProductConfigInput]
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
      travelProductConfigs: $travelProductConfigs
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
    $travelProductConfigs: [TravelProductConfigInput]
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
      travelProductConfigs: $travelProductConfigs
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

const DEST_ADD = gql`
  mutation InsuranceDestinationAdd($name: String!, $code: String!) {
    insuranceDestinationAdd(name: $name, code: $code) {
      _id
    }
  }
`;

const DEST_EDIT = gql`
  mutation InsuranceDestinationEdit($_id: ID!, $name: String, $code: String) {
    insuranceDestinationEdit(_id: $_id, name: $name, code: $code) {
      _id
    }
  }
`;

const DEST_REMOVE = gql`
  mutation InsuranceDestinationRemove($id: ID!) {
    insuranceDestinationRemove(_id: $id)
  }
`;

export default {
  PRODUCTS_ADD,
  PRODUCTS_EDIT,
  PRODUCTS_REMOVE,
  DEST_ADD,
  DEST_EDIT,
  DEST_REMOVE,
};
