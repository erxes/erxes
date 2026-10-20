import { gql as apolloGql } from '@apollo/client';
import { gql } from '~/gql';

// Risk Type Mutations
export const CREATE_RISK_TYPE = gql(`
  mutation InsuranceCreateRiskType($name: String!, $description: String) {
    createRiskType(name: $name, description: $description) {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
`);

export const UPDATE_RISK_TYPE = gql(`
  mutation InsuranceUpdateRiskType(
    $id: ID!
    $name: String
    $description: String
  ) {
    updateRiskType(id: $id, name: $name, description: $description) {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
`);

export const DELETE_RISK_TYPE = gql(`
  mutation InsuranceDeleteRiskType($id: ID!) {
    deleteRiskType(id: $id)
  }
`);

// Insurance Type Mutations
export const CREATE_INSURANCE_TYPE = gql(`
  mutation InsuranceCreateType(
    $name: String!
    $attributes: [AttributeInput!]
    $isCitizen: Boolean
  ) {
    createInsuranceType(
      name: $name
      attributes: $attributes
      isCitizen: $isCitizen
    ) {
      id
      name
      isCitizen
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
    }
  }
`);

export const UPDATE_INSURANCE_TYPE = gql(`
  mutation InsuranceUpdateType(
    $id: ID!
    $name: String
    $attributes: [AttributeInput!]
    $isCitizen: Boolean
  ) {
    updateInsuranceType(
      id: $id
      name: $name
      attributes: $attributes
      isCitizen: $isCitizen
    ) {
      id
      name
      isCitizen
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
    }
  }
`);

export const DELETE_INSURANCE_TYPE = gql(`
  mutation InsuranceDeleteType($id: ID!) {
    deleteInsuranceType(id: $id)
  }
`);

// Insurance Product Mutations
export const CREATE_INSURANCE_PRODUCT = gql(`
  mutation InsuranceCreateProduct(
    $name: String!
    $insuranceTypeId: ID!
    $coveredRisks: [CoveredRiskInput!]!
    $pricingConfig: JSON!
    $pdfContent: String
    $additionalCoverages: [AdditionalCoverageInput!]
    $compensationCalculations: [CompensationCalculationInput!]
    $deductibleConfig: DeductibleConfigInput
    $regionIds: [ID!]
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
      regionIds: $regionIds
    ) {
      id
      name
      insuranceType {
        id
        name
        isCitizen
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
      }
      regions {
        id
        name
        countries
        createdAt
        updatedAt
      }
      coveredRisks {
        risk {
          id
          name
          description
          createdAt
          updatedAt
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
    }
  }
`);

export const UPDATE_INSURANCE_PRODUCT = gql(`
  mutation InsuranceUpdateProduct(
    $id: ID!
    $name: String
    $coveredRisks: [CoveredRiskInput!]
    $pricingConfig: JSON
    $pdfContent: String
    $additionalCoverages: [AdditionalCoverageInput!]
    $compensationCalculations: [CompensationCalculationInput!]
    $deductibleConfig: DeductibleConfigInput
    $regionIds: [ID!]
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
      regionIds: $regionIds
    ) {
      id
      name
      insuranceType {
        id
        name
        isCitizen
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
      }
      regions {
        id
        name
        countries
        createdAt
        updatedAt
      }
      coveredRisks {
        risk {
          id
          name
          description
          createdAt
          updatedAt
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
    }
  }
`);

export const DELETE_INSURANCE_PRODUCT = gql(`
  mutation InsuranceDeleteProduct($id: ID!) {
    deleteInsuranceProduct(id: $id)
  }
`);

// Vendor Mutations
export const CREATE_VENDOR = apolloGql`
  mutation InsuranceCreateVendor($name: String!) {
    createVendor(name: $name) {
      id
      name
      offeredProducts {
        product {
          id
          name
          insuranceType {
            id
            name
            isCitizen
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
          }
          regions {
            id
            name
            countries
            createdAt
            updatedAt
          }
          coveredRisks {
            risk {
              id
              name
              description
              createdAt
              updatedAt
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
        }
        pricingOverride
        discountTiers {
          minTravelers
          discountPercent
        }
      }
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_VENDOR = apolloGql`
  mutation InsuranceUpdateVendor($id: ID!, $name: String!) {
    updateVendor(id: $id, name: $name) {
      id
      name
      offeredProducts {
        product {
          id
          name
          insuranceType {
            id
            name
            isCitizen
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
          }
          regions {
            id
            name
            countries
            createdAt
            updatedAt
          }
          coveredRisks {
            risk {
              id
              name
              description
              createdAt
              updatedAt
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
        }
        pricingOverride
        discountTiers {
          minTravelers
          discountPercent
        }
      }
      createdAt
      updatedAt
    }
  }
`;

export const ADD_PRODUCT_TO_VENDOR = apolloGql`
  mutation InsuranceAddProductToVendor(
    $vendorId: ID!
    $productId: ID!
    $pricingOverride: JSON
    $discountTiers: [DiscountTierInput!]
  ) {
    addProductToVendor(
      vendorId: $vendorId
      productId: $productId
      pricingOverride: $pricingOverride
      discountTiers: $discountTiers
    ) {
      id
      name
      offeredProducts {
        product {
          id
          name
          insuranceType {
            id
            name
            isCitizen
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
          }
          regions {
            id
            name
            countries
            createdAt
            updatedAt
          }
          coveredRisks {
            risk {
              id
              name
              description
              createdAt
              updatedAt
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
        }
        pricingOverride
        discountTiers {
          minTravelers
          discountPercent
        }
      }
      createdAt
      updatedAt
    }
  }
`;

export const REMOVE_PRODUCT_FROM_VENDOR = apolloGql`
  mutation InsuranceRemoveProductFromVendor($vendorId: ID!, $productId: ID!) {
    removeProductFromVendor(vendorId: $vendorId, productId: $productId) {
      id
      name
      offeredProducts {
        product {
          id
          name
          insuranceType {
            id
            name
            isCitizen
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
          }
          regions {
            id
            name
            countries
            createdAt
            updatedAt
          }
          coveredRisks {
            risk {
              id
              name
              description
              createdAt
              updatedAt
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
        }
        pricingOverride
        discountTiers {
          minTravelers
          discountPercent
        }
      }
      createdAt
      updatedAt
    }
  }
`;

// Customer Mutations
export const CREATE_CUSTOMER = apolloGql`
  mutation InsuranceCreateCustomer($input: InsuranceCustomerInput!) {
    createCustomer(input: $input) {
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
    }
  }
`;

export const UPDATE_CUSTOMER = apolloGql`
  mutation InsuranceUpdateCustomer($id: ID!, $input: InsuranceCustomerInput) {
    updateCustomer(id: $id, input: $input) {
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
    }
  }
`;

export const DELETE_CUSTOMER = apolloGql`
  mutation InsuranceDeleteCustomer($id: ID!) {
    deleteCustomer(id: $id)
  }
`;

// Contract Mutations
export const CREATE_INSURANCE_CONTRACT = apolloGql`
  mutation InsuranceCreateContract(
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
      id
      contractNumber
      vendor {
        id
        name
      }
      customer {
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
          id
          name
          description
          createdAt
          updatedAt
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
    }
  }
`;

export const GENERATE_CONTRACT_PDF = apolloGql`
  mutation InsuranceGenerateContractPDF($contractId: ID!) {
    generateContractPDF(contractId: $contractId) {
      success
      base64
      filename
    }
  }
`;

// Vendor User Mutations
export const CREATE_VENDOR_USER = apolloGql`
  mutation InsuranceCreateVendorUser(
    $name: String
    $email: String!
    $phone: String
    $password: String!
    $vendorId: ID!
    $role: String
  ) {
    createVendorUser(
      name: $name
      email: $email
      phone: $phone
      password: $password
      vendorId: $vendorId
      role: $role
    ) {
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
    }
  }
`;

export const UPDATE_VENDOR_USER = apolloGql`
  mutation InsuranceUpdateVendorUser(
    $id: ID!
    $name: String
    $email: String
    $phone: String
    $password: String
    $role: String
  ) {
    updateVendorUser(
      id: $id
      name: $name
      email: $email
      phone: $phone
      password: $password
      role: $role
    ) {
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
    }
  }
`;

export const DELETE_VENDOR_USER = apolloGql`
  mutation InsuranceDeleteVendorUser($id: ID!) {
    deleteVendorUser(id: $id)
  }
`;

// Region Mutations

export const CREATE_INSURANCE_REGION = gql(`
  mutation InsuranceCreateRegion($name: String!, $countries: [String!]!) {
    createInsuranceRegion(name: $name, countries: $countries) {
      id
      name
      countries
      createdAt
      updatedAt
    }
  }
`);

export const UPDATE_INSURANCE_REGION = gql(`
  mutation InsuranceUpdateRegion(
    $id: ID!
    $name: String
    $countries: [String!]
  ) {
    updateInsuranceRegion(id: $id, name: $name, countries: $countries) {
      id
      name
      countries
      createdAt
      updatedAt
    }
  }
`);

export const DELETE_INSURANCE_REGION = gql(`
  mutation InsuranceDeleteRegion($id: ID!) {
    deleteInsuranceRegion(id: $id)
  }
`);

export const ADD_COUNTRY_TO_REGION = gql(`
  mutation InsuranceAddCountryToRegion($regionId: ID!, $country: String!) {
    addCountryToRegion(regionId: $regionId, country: $country) {
      id
      name
      countries
      createdAt
      updatedAt
    }
  }
`);

export const REMOVE_COUNTRY_FROM_REGION = gql(`
  mutation InsuranceRemoveCountryFromRegion($regionId: ID!, $country: String!) {
    removeCountryFromRegion(regionId: $regionId, country: $country) {
      id
      name
      countries
      createdAt
      updatedAt
    }
  }
`);

export const SEED_INSURANCE_REGIONS = gql(`
  mutation InsuranceSeedRegions {
    seedInsuranceRegions {
      id
      name
      countries
      createdAt
      updatedAt
    }
  }
`);

export const mutations = {
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
  CREATE_INSURANCE_REGION,
  UPDATE_INSURANCE_REGION,
  DELETE_INSURANCE_REGION,
  ADD_COUNTRY_TO_REGION,
  REMOVE_COUNTRY_FROM_REGION,
  SEED_INSURANCE_REGIONS,
};
