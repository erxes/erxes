const listParamsDef = `
  $page: Int
  $perPage: Int
  $sortField: String
  $sortDirection: Int
`;

const listParamsValue = `
  page: $page
  perPage: $perPage
  sortField: $sortField
  sortDirection: $sortDirection
`;

export const loansResearchFields = `
  _id
  apiUrl
  isLocalUser
  userDN
  adminDN
  adminPassword
  code
  createdAt
`;

const loansResearchMain = `
  query loansResearchMain(${listParamsDef}) {
    loansResearchMain(${listParamsValue}) {
      list {
        ${loansResearchFields}
      }
      totalCount
    }
  }
`;

const loanResearchDetail = `
query loanResearchDetail($_id: String!)) {
  loanResearchDetail(_id: $_id) {
    ${loansResearchFields}
  }
}
`;

export default { loansResearchMain, loanResearchDetail };
