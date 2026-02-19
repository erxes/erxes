import { gql } from '@apollo/client';

// Common fields
export const riskTypeFields = `
  id
  name
  description
  createdAt
  updatedAt
`;

export const insuranceTypeFields = `
  id
  name
  attributes {
    name
    dataType
    required
    description
    options
    min
    max
  }
  createdAt
  updatedAt
`;

export const insuranceProductFields = `
  id
  name
  insuranceType {
    ${insuranceTypeFields}
  }
  coveredRisks {
    risk {
      ${riskTypeFields}
    }
    coveragePercentage
  }
  pricingConfig
  pdfContent
  additionalCoverages {
    name
    limits
    appliesTo
  }
  compensationCalculations {
    name
    methodologies
  }
  deductibleConfig {
    levels
  }
  createdAt
  updatedAt
`;

export const insuranceVendorFields = `
  id
  name
  offeredProducts {
    product {
      ${insuranceProductFields}
    }
    pricingOverride
  }
  createdAt
  updatedAt
`;

export const vendorUserFields = `
  id
  name
  email
  phone
  vendor {
    id
    name
  }
  role
  createdAt
  updatedAt
`;

export const insuranceCustomerFields = `
  id
  firstName
  lastName
  type
  registrationNumber
  email
  phone
  companyName
  createdAt
  updatedAt
`;

export const insuranceContractFields = `
  id
  contractNumber
  vendor {
    id
    name
  }
  customer {
    ${insuranceCustomerFields}
  }
  insuranceType {
    id
    name
  }
  insuranceProduct {
    id
    name
    pdfContent
  }
  coveredRisks {
    risk {
      ${riskTypeFields}
    }
    coveragePercentage
  }
  chargedAmount
  startDate
  endDate
  insuredObject
  paymentKind
  paymentStatus
  pdfContent
  createdAt
  updatedAt
`;

// Queries
export const RISK_TYPES = gql`
  query RiskTypes {
    riskTypes {
      ${riskTypeFields}
    }
  }
`;

export const RISK_TYPE = gql`
  query RiskType($id: ID!) {
    riskType(id: $id) {
      ${riskTypeFields}
    }
  }
`;

export const INSURANCE_TYPES = gql`
  query InsuranceTypes {
    insuranceTypes {
      ${insuranceTypeFields}
    }
  }
`;

export const INSURANCE_TYPE = gql`
  query InsuranceType($id: ID!) {
    insuranceType(id: $id) {
      ${insuranceTypeFields}
    }
  }
`;

export const INSURANCE_PRODUCTS = gql`
  query InsuranceProducts {
    insuranceProducts {
      ${insuranceProductFields}
    }
  }
`;

export const INSURANCE_PRODUCT = gql`
  query InsuranceProduct($id: ID!) {
    insuranceProduct(id: $id) {
      ${insuranceProductFields}
    }
  }
`;

export const PRODUCTS_BY_TYPE = gql`
  query ProductsByType($typeId: ID!) {
    productsByType(typeId: $typeId) {
      ${insuranceProductFields}
    }
  }
`;

export const VENDORS = gql`
  query Vendors {
    vendors {
      ${insuranceVendorFields}
    }
  }
`;

export const VENDOR = gql`
  query Vendor($id: ID!) {
    vendor(id: $id) {
      ${insuranceVendorFields}
    }
  }
`;

export const VENDOR_USERS = gql`
  query VendorUsers($vendorId: ID) {
    vendorUsers(vendorId: $vendorId) {
      ${vendorUserFields}
    }
  }
`;

export const VENDOR_USER = gql`
  query VendorUser($id: ID!) {
    vendorUser(id: $id) {
      ${vendorUserFields}
    }
  }
`;

export const INSURANCE_CUSTOMERS = gql`
  query InsuranceCustomers {
    insuranceCustomers {
      ${insuranceCustomerFields}
    }
  }
`;

export const INSURANCE_CUSTOMER = gql`
  query InsuranceCustomer($id: ID!) {
    insuranceCustomer(id: $id) {
      ${insuranceCustomerFields}
    }
  }
`;

export const CONTRACTS = gql`
  query Contracts($vendorId: ID, $customerId: ID) {
    contracts(vendorId: $vendorId, customerId: $customerId) {
      ${insuranceContractFields}
    }
  }
`;

export const CONTRACT = gql`
  query Contract($id: ID!) {
    contract(id: $id) {
      ${insuranceContractFields}
    }
  }
`;

export const VENDOR_CONTRACTS = gql`
  query VendorContracts {
    vendorContracts {
      ${insuranceContractFields}
    }
  }
`;

export const VENDOR_CONTRACT = gql`
  query VendorContract($id: ID!) {
    vendorContract(id: $id) {
      ${insuranceContractFields}
    }
  }
`;

export default {
  RISK_TYPES,
  RISK_TYPE,
  INSURANCE_TYPES,
  INSURANCE_TYPE,
  INSURANCE_PRODUCTS,
  INSURANCE_PRODUCT,
  PRODUCTS_BY_TYPE,
  VENDORS,
  VENDOR,
  VENDOR_USERS,
  VENDOR_USER,
  INSURANCE_CUSTOMERS,
  INSURANCE_CUSTOMER,
  CONTRACTS,
  CONTRACT,
  VENDOR_CONTRACTS,
  VENDOR_CONTRACT,
};
