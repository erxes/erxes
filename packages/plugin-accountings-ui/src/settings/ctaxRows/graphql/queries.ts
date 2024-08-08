export const ctaxRowFields = `
  _id
  name
  number
  kind
  formula
  formulaText
  status
  percent
`;

const ctaxRowsFilterParamDefs = `
  $status: String,
  $searchValue: String,
  $ids: [String],
  $excludeIds: Boolean,
`;

const ctaxRowsFilterParams = `
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

const ctaxRows = `
  query ctaxRows(${ctaxRowsFilterParamDefs}, ${commonParamDefs}) {
    ctaxRows(${ctaxRowsFilterParams}, ${commonParams}) {
      ${ctaxRowFields}
    }
  }
`;

const ctaxRowDetail = `
  query ctaxRowDetail($_id: String!) {
    ctaxRowDetail(_id: $_id) {
      ${ctaxRowFields}
    }
  }
`;

const ctaxRowsCount = `
  query ctaxRowsCount(${ctaxRowsFilterParamDefs}) {
    ctaxRowsCount(${ctaxRowsFilterParams})
  }
`;

export default {
  ctaxRows,
  ctaxRowDetail,
  ctaxRowsCount,
};
