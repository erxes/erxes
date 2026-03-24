import { gql } from '@apollo/client';
import {
  riskTypeFields,
  insuranceTypeFields,
  insuranceProductFields,
  insuranceVendorFields,
  vendorUserFields,
  insuranceCustomerFields,
  insuranceContractFields,
} from './queries';

// Risk Type Mutations
export const CREATE_RISK_TYPE = gql`
  mutation CreateRiskType($name: String!, $description: String) {
    createRiskType(name: $name, description: $description) {
      ${riskTypeFields}
    }
  }
`;

export const UPDATE_RISK_TYPE = gql`
  mutation UpdateRiskType($id: ID!, $name: String, $description: String) {
    updateRiskType(id: $id, name: $name, description: $description) {
      ${riskTypeFields}
    }
  }
`;

export const DELETE_RISK_TYPE = gql`
  mutation DeleteRiskType($id: ID!) {
    deleteRiskType(id: $id)
  }
`;

// Insurance Type Mutations
export const CREATE_INSURANCE_TYPE = gql`
  mutation CreateInsuranceType($name: String!, $attributes: [AttributeInput!]) {
    createInsuranceType(name: $name, attributes: $attributes) {
      ${insuranceTypeFields}
    }
  }
`;

export const UPDATE_INSURANCE_TYPE = gql`
  mutation UpdateInsuranceType($id: ID!, $name: String, $attributes: [AttributeInput!]) {
    updateInsuranceType(id: $id, name: $name, attributes: $attributes) {
      ${insuranceTypeFields}
    }
  }
`;

export const DELETE_INSURANCE_TYPE = gql`
  mutation DeleteInsuranceType($id: ID!) {
    deleteInsuranceType(id: $id)
  }
`;

// Insurance Product Mutations
export const CREATE_INSURANCE_PRODUCT = gql`
  mutation CreateInsuranceProduct(
    $name: String!
    $insuranceTypeId: ID!
    $coveredRisks: [CoveredRiskInput!]!
    $pricingConfig: JSON!
    $pdfContent: String
    $additionalCoverages: [AdditionalCoverageInput!]
    $compensationCalculations: [CompensationCalculationInput!]
    $deductibleConfig: DeductibleConfigInput
  ) {
    createInsuranceProduct(
      name: $name
      insuranceTypeId: $insuranceTypeId
      coveredRisks: $coveredRisks
      pricingConfig: $pricingConfig
      pdfContent: $pdfContent
      additionalCoverages: $additionalCoverages
      compensationCalculations: $compensationCalculations
      deductibleConfig: $deductibleConfig
    ) {
      ${insuranceProductFields}
    }
  }
`;

export const UPDATE_INSURANCE_PRODUCT = gql`
  mutation UpdateInsuranceProduct(
    $id: ID!
    $name: String
    $coveredRisks: [CoveredRiskInput!]
    $pricingConfig: JSON
    $pdfContent: String
    $additionalCoverages: [AdditionalCoverageInput!]
    $compensationCalculations: [CompensationCalculationInput!]
    $deductibleConfig: DeductibleConfigInput
  ) {
    updateInsuranceProduct(
      id: $id
      name: $name
      coveredRisks: $coveredRisks
      pricingConfig: $pricingConfig
      pdfContent: $pdfContent
      additionalCoverages: $additionalCoverages
      compensationCalculations: $compensationCalculations
      deductibleConfig: $deductibleConfig
    ) {
      ${insuranceProductFields}
    }
  }
`;

export const DELETE_INSURANCE_PRODUCT = gql`
  mutation DeleteInsuranceProduct($id: ID!) {
    deleteInsuranceProduct(id: $id)
  }
`;

// Vendor Mutations
export const CREATE_VENDOR = gql`
  mutation CreateVendor($name: String!) {
    createVendor(name: $name) {
      ${insuranceVendorFields}
    }
  }
`;

export const UPDATE_VENDOR = gql`
  mutation UpdateVendor($id: ID!, $name: String!) {
    updateVendor(id: $id, name: $name) {
      ${insuranceVendorFields}
    }
  }
`;

export const ADD_PRODUCT_TO_VENDOR = gql`
  mutation AddProductToVendor($vendorId: ID!, $productId: ID!, $pricingOverride: JSON) {
    addProductToVendor(vendorId: $vendorId, productId: $productId, pricingOverride: $pricingOverride) {
      ${insuranceVendorFields}
    }
  }
`;

export const REMOVE_PRODUCT_FROM_VENDOR = gql`
  mutation RemoveProductFromVendor($vendorId: ID!, $productId: ID!) {
    removeProductFromVendor(vendorId: $vendorId, productId: $productId) {
      ${insuranceVendorFields}
    }
  }
`;

// Customer Mutations
export const CREATE_CUSTOMER = gql`
  mutation CreateCustomer($input: InsuranceCustomerInput!) {
    createCustomer(input: $input) {
      ${insuranceCustomerFields}
    }
  }
`;

export const UPDATE_CUSTOMER = gql`
  mutation UpdateCustomer($id: ID!, $input: InsuranceCustomerInput) {
    updateCustomer(id: $id, input: $input) {
      ${insuranceCustomerFields}
    }
  }
`;

export const DELETE_CUSTOMER = gql`
  mutation DeleteCustomer($id: ID!) {
    deleteCustomer(id: $id)
  }
`;

// Contract Mutations
export const CREATE_INSURANCE_CONTRACT = gql`
  mutation CreateInsuranceContract(
    $vendorId: ID!
    $customerId: ID!
    $productId: ID!
    $insuredObject: JSON!
    $startDate: Date!
    $endDate: Date!
    $paymentKind: String!
  ) {
    createInsuranceContract(
      vendorId: $vendorId
      customerId: $customerId
      productId: $productId
      insuredObject: $insuredObject
      startDate: $startDate
      endDate: $endDate
      paymentKind: $paymentKind
    ) {
      ${insuranceContractFields}
    }
  }
`;

export const GENERATE_CONTRACT_PDF = gql`
  mutation GenerateContractPDF($contractId: ID!) {
    generateContractPDF(contractId: $contractId) {
      success
      base64
      filename
    }
  }
`;

// Vendor User Mutations
export const CREATE_VENDOR_USER = gql`
  mutation CreateVendorUser($name: String, $email: String!, $phone: String, $password: String!, $vendorId: ID!, $role: String) {
    createVendorUser(name: $name, email: $email, phone: $phone, password: $password, vendorId: $vendorId, role: $role) {
      ${vendorUserFields}
    }
  }
`;

export const UPDATE_VENDOR_USER = gql`
  mutation UpdateVendorUser($id: ID!, $name: String, $email: String, $phone: String, $password: String, $role: String) {
    updateVendorUser(id: $id, name: $name, email: $email, phone: $phone, password: $password, role: $role) {
      ${vendorUserFields}
    }
  }
`;

export const DELETE_VENDOR_USER = gql`
  mutation DeleteVendorUser($id: ID!) {
    deleteVendorUser(id: $id)
  }
`;

export default {
  CREATE_RISK_TYPE,
  UPDATE_RISK_TYPE,
  DELETE_RISK_TYPE,
  CREATE_INSURANCE_TYPE,
  UPDATE_INSURANCE_TYPE,
  DELETE_INSURANCE_TYPE,
  CREATE_INSURANCE_PRODUCT,
  UPDATE_INSURANCE_PRODUCT,
  DELETE_INSURANCE_PRODUCT,
  CREATE_VENDOR,
  UPDATE_VENDOR,
  ADD_PRODUCT_TO_VENDOR,
  REMOVE_PRODUCT_FROM_VENDOR,
  CREATE_VENDOR_USER,
  UPDATE_VENDOR_USER,
  DELETE_VENDOR_USER,
  CREATE_CUSTOMER,
  UPDATE_CUSTOMER,
  DELETE_CUSTOMER,
  CREATE_INSURANCE_CONTRACT,
  GENERATE_CONTRACT_PDF,
};
