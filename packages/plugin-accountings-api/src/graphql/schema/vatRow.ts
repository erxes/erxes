export const types = () => `
  type VatRow @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    name: String
    number: String
    kind: String
    formula: String
    formula_text: String
    tab_count: Float
    is_b: Boolean
    status: String
    percent: Float
  }
`;

const vatRowParams = `
  name: String
  number: String
  kind: String
  formula: String
  formula_text: String
  tab_count: Float
  is_bold: Boolean
  status: String
  percent: Float
`;

const vatRowsQueryParams = `
  status: String,
  searchValue: String,
  ids: [String],
  excludeIds: Boolean,
`;

export const queries = `
  vatRows(
    ${vatRowsQueryParams},
    page: Int,
    perPage: Int,
    sortField: String
    sortDirection: Int    
  ): [VatRow]
  vatRowsCount(${vatRowsQueryParams}): Int
  vatRowDetail(_id: String): VatRow
`;

export const mutations = `
  vatRowsAdd(${vatRowParams}): VatRow
  vatRowsEdit(_id: String!, ${vatRowParams}): VatRow
  vatRowsRemove(accountIds: [String!]): String
`;
