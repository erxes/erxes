const insuranceTypeFields = `
  _id
      entity
      contributionType
      chooseBoard 
      frequency
      metric
      goalType
      contribution
      startDate
      endDate
      target
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

export const goalTypes = `
  query goalTypes(${listParamsDef}) {
    goalTypes(${listParamsValue}) {
      ${insuranceTypeFields}
    }
  }
`;

export const goalTypesMain = `
  query goalTypesMain(${listParamsDef}) {
    goalTypesMain(${listParamsValue}) {
      list {
        ${insuranceTypeFields}
      }

      totalCount
    }
  }
`;

export const goalTypeCounts = `
  query goalTypeCounts(${listParamsDef}, $only: String) {
    goalTypeCounts(${listParamsValue}, only: $only)
  }
`;

export const goalTypeDetail = `
  query goalTypeDetail($_id: String!) {
    goalTypeDetail(_id: $_id) {
      ${insuranceTypeFields}
    }
  }
`;

export default {
  goalTypes,
  goalTypesMain,
  goalTypeCounts,
  goalTypeDetail
};
