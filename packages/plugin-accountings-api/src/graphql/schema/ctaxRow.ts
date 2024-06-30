export const types = () => `
  type CtaxRow @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    name: String
    number: String
    kind: String
    formula: String
    formula_text: String
  }
`;

const ctaxRowParams = `
  name: String
  number: String
  kind: String
  formula: String
  formula_text: String
`;

const ctaxRowsQueryParams = `
  searchValue: String
  kinds: [String]
  status: String
`;

export const queries = `
  ctaxRows(
    ${ctaxRowsQueryParams},
    page: Int,
    perPage: Int,
    sortField: String
    sortDirection: Int    
  ): [CtaxRow]
  ctaxRowsTotalCount(${ctaxRowsQueryParams}): Int
  ctaxRowDetail(_id: String): CtaxRow
`;

export const mutations = `
  ctaxRowsAdd(${ctaxRowParams}): CtaxRow
  ctaxRowsEdit(_id: String!, ${ctaxRowParams}): CtaxRow
  ctaxRowsRemove(accountIds: [String!]): String
`;
