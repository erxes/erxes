import { gql } from '@apollo/client';

export const AGENTS_QUERY = gql`
  query AgentsMain(
    $page: Int
    $perPage: Int
    $status: String
    $customerIds: [String]
    $companyIds: [String]
  ) {
    agentsMain(
      page: $page
      perPage: $perPage
      status: $status
      customerIds: $customerIds
      companyIds: $companyIds
    ) {
      list {
        _id
        number
        status
        hasReturn
        returnAmount
        returnPercent
        prepaidPercent
        discountPercent
        startDate
        endDate
        startMonth
        endMonth
        startDay
        endDay
        customerIds
        companyIds
        productRuleIds
        rulesOfProducts
      }
      totalCount
    }
  }
`;

export const AGENT_CUSTOMERS_QUERY = gql`
  query AgentCustomers($limit: Int, $searchValue: String) {
    customers(limit: $limit, searchValue: $searchValue) {
      list {
        _id
        firstName
        lastName
        primaryEmail
        primaryPhone
      }
    }
  }
`;

export const AGENT_COMPANIES_QUERY = gql`
  query AgentCompanies($limit: Int, $searchValue: String) {
    companies(limit: $limit, searchValue: $searchValue) {
      list {
        _id
        primaryName
        names
      }
    }
  }
`;

export const AGENT_PRODUCT_RULES_QUERY = gql`
  query ProductRules {
    productRules {
      _id
      categoryIds
      excludeCategoryIds
      productIds
      excludeProductIds
      tagIds
      excludeTagIds
      unitPrice
      bundleId
      name
      categories {
        _id
        name
        description
        meta
        parentId
        code
        order
        scopeBrandIds

        status
        isRoot
        productCount
        maskType
        mask
        isSimilarity
        similarities
      }
      excludeCategories {
        _id
        name
        description
        meta
        parentId
        code
        order
        scopeBrandIds

        status
        isRoot
        productCount
        maskType
        mask
        isSimilarity
        similarities
      }
      products {
        _id
        name
        shortName
        status
        code
        type
        description
        barcodes
        variants
        barcodeDescription
        unitPrice
        categoryId
        propertiesData
        createdAt
        tagIds

        vendorId
        scopeBrandIds
        uom
        subUoms
        currency

        hasSimilarity

        cursor
        inventories
        discounts
        remainder
        discount
      }
    }
  }
`;
