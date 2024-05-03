export const types = () => `
  type VATRow @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    name: String
    number: String
    kind: String
    formula: String
    formula_text: String
    tab_count: Float
    is_b: Boolean
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
`;

const vatRowsQueryParams = `
  searchValue: String
  kinds: [String]
  status: String
`;

export const queries = `
  vatRows(
    ${vatRowsQueryParams},
    page: Int,
    perPage: Int,
    sortField: String
    sortDirection: Int    
  ): [VATRow]
  vatRowsTotalCount(${vatRowsQueryParams}): Int
  vatRowDetail(_id: String): VATRow
`;

export const mutations = `
  vatRowsAdd(${vatRowParams}): VATRow
  vatRowsEdit(_id: String!, ${vatRowParams}): VATRow
  vatRowsRemove(accountIds: [String!]): String
`;
