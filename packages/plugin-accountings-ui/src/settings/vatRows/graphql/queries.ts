export const vatRowFields = `
  _id
  name
  number
  kind
  formula
  formula_text
  tab_count
  is_b
`;

const vatRowsFilterParamDefs = `
  $status: String,
  $searchValue: String,
  $ids: [String],
  $excludeIds: Boolean,
`;

const vatRowsFilterParams = `
  status: $status,
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
