const insuranceTypeFields = `
  _id
  createdAt
  code
  name
  description
  companyId
  percent
  yearPercents
  company {
    code
    primaryName
  }
`;

const listParamsDef = `
  $page: Int
  $perPage: Int
  $ids: [String]
  $searchValue: String
  $sortField: String
  $sortDirection: Int
`;

const listParamsValue = `
  page: $page
  perPage: $perPage
  ids: $ids
  searchValue: $searchValue
  sortField: $sortField
  sortDirection: $sortDirection
`;

export const insuranceTypes = `
  query insuranceTypes(${listParamsDef}) {
    insuranceTypes(${listParamsValue}) {
      ${insuranceTypeFields}
    }
  }
`;

export const insuranceTypesMain = `
  query insuranceTypesMain(${listParamsDef}) {
    insuranceTypesMain(${listParamsValue}) {
      list {
        ${insuranceTypeFields}
      }

      totalCount
    }
  }
`;

export const insuranceTypeCounts = `
  query insuranceTypeCounts(${listParamsDef}, $only: String) {
    insuranceTypeCounts(${listParamsValue}, only: $only)
  }
`;

export const insuranceTypeDetail = `
  query insuranceTypeDetail($_id: String!) {
    insuranceTypeDetail(_id: $_id) {
      ${insuranceTypeFields}
    }
  }
`;

export default {
  insuranceTypes,
  insuranceTypesMain,
  insuranceTypeCounts,
  insuranceTypeDetail
};
