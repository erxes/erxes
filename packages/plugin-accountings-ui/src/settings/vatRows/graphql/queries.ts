export const vatRowFields = `
  _id
  name
  number
  kind
  formula
  formulaText
  tabCount
  isBold
  status
  percent
`;

const vatRowsFilterParamDefs = `
  $status: String,
  $name: String,
  $number: String,
  $searchValue: String,
  $ids: [String],
  $excludeIds: Boolean,
`;

const vatRowsFilterParams = `
  status: $status,
  name: $name,
  number: $number,
  searchValue: $searchValue,
  ids: $ids,
  excludeIds: $excludeIds,
`;

const commonParamDefs = `
  $page: Int,
  $perPage: Int,
  $sortField: String,
  $sortDirection: Int
`;

const commonParams = `
  page: $page,
  perPage: $perPage
  sortField: $sortField,
  sortDirection: $sortDirection
`;

const vatRows = `
  query vatRows(${vatRowsFilterParamDefs}, ${commonParamDefs}) {
    vatRows(${vatRowsFilterParams}, ${commonParams}) {
      ${vatRowFields}
    }
  }
`;

const vatRowDetail = `
  query vatRowDetail($_id: String!) {
    vatRowDetail(_id: $_id) {
      ${vatRowFields}
    }
  }
`;

const vatRowsCount = `
  query vatRowsCount(${vatRowsFilterParamDefs}) {
    vatRowsCount(${vatRowsFilterParams})
  }
`;

export default {
  vatRows,
  vatRowDetail,
  vatRowsCount,
};
