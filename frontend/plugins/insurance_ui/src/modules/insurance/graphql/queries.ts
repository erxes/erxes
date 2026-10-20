import { gql } from '~/gql';

// Queries
export const RISK_TYPES = gql(`
  query InsuranceRiskTypes {
    riskTypes {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
`);

export const RISK_TYPE = gql(`
  query InsuranceRiskType($id: ID!) {
    riskType(id: $id) {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
`);

export const INSURANCE_TYPES = gql(`
  query InsuranceTypes {
    insuranceTypes {
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

export const INSURANCE_TYPE = gql(`
  query InsuranceType($id: ID!) {
    insuranceType(id: $id) {
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

export const INSURANCE_PRODUCTS = gql(`
  query InsuranceProducts {
    insuranceProducts {
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

export const INSURANCE_PRODUCT = gql(`
  query InsuranceProduct($id: ID!) {
    insuranceProduct(id: $id) {
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

export const PRODUCTS_BY_TYPE = gql(`
  query InsuranceProductsByType($typeId: ID!) {
    productsByType(typeId: $typeId) {
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

export const VENDORS = gql(`
  query InsuranceVendors {
    vendors {
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
`);

export const VENDOR = gql(`
  query InsuranceVendor($id: ID!) {
    vendor(id: $id) {
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
`);

export const VENDOR_USERS = gql(`
  query InsuranceVendorUsers($vendorId: ID) {
    vendorUsers(vendorId: $vendorId) {
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
`);

export const VENDOR_USER = gql(`
  query InsuranceVendorUser($id: ID!) {
    vendorUser(id: $id) {
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
`);

export const INSURANCE_CUSTOMERS = gql(`
  query InsuranceCustomers {
    insuranceCustomers {
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
`);

export const INSURANCE_CUSTOMER = gql(`
  query InsuranceCustomer($id: ID!) {
    insuranceCustomer(id: $id) {
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
`);

export const CONTRACTS = gql(`
  query InsuranceContracts(
    $vendorId: ID
    $customerId: ID
    $searchValue: String
    $contractNumber: String
    $customerRegistration: String
    $plateNumber: String
    $paymentStatus: String
    $insuranceTypeId: ID
    $startDate: Date
    $endDate: Date
  ) {
    contracts(
      vendorId: $vendorId
      customerId: $customerId
      searchValue: $searchValue
      contractNumber: $contractNumber
      customerRegistration: $customerRegistration
      plateNumber: $plateNumber
      paymentStatus: $paymentStatus
      insuranceTypeId: $insuranceTypeId
      startDate: $startDate
      endDate: $endDate
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
`);

export const CONTRACT = gql(`
  query InsuranceContract($id: ID!) {
    contract(id: $id) {
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
`);

export const VENDOR_CONTRACTS = gql(`
  query InsuranceVendorContracts {
    vendorContracts {
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
`);

export const VENDOR_CONTRACT = gql(`
  query InsuranceVendorContract($id: ID!) {
    vendorContract(id: $id) {
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
`);

export const INSURANCE_REGIONS = gql(`
  query InsuranceRegions {
    insuranceRegions {
      id
      name
      countries
      createdAt
      updatedAt
    }
  }
`);

export const INSURANCE_REGION = gql(`
  query InsuranceRegion($id: ID!) {
    insuranceRegion(id: $id) {
      id
      name
      countries
      createdAt
      updatedAt
    }
  }
`);

export const PRODUCTS_BY_COUNTRY = gql(`
  query InsuranceProductsByCountry($country: String!) {
    productsByCountry(country: $country) {
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

export const CALCULATE_TRAVEL_PRICE = gql(`
  query InsuranceCalculateTravelPrice(
    $productId: ID!
    $vendorId: ID!
    $startDate: Date!
    $endDate: Date!
    $travelerCount: Int!
  ) {
    calculateTravelPrice(
      productId: $productId
      vendorId: $vendorId
      startDate: $startDate
      endDate: $endDate
      travelerCount: $travelerCount
    ) {
      perPerson
      total
      discountPercent
      days
      travelerCount
      dailyRate
    }
  }
`);

export const queries = {
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
  INSURANCE_REGIONS,
  INSURANCE_REGION,
  PRODUCTS_BY_COUNTRY,
  CALCULATE_TRAVEL_PRICE,
};
