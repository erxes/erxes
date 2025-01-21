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
  dealId
  customerType
  customerId
  incomes {
    _id
    incomeType
    files {
      url
      name
      size
      type
    }
  }
  loans {
    _id
    startDate
    closeDate
    files {
      url
      name
      size
      type
    }
  }
  totalMonth
  totalIncome
  monthlyIncome
  totalLoanAmount
  monthlyPaymentAmount
  debtIncomeRatio
  increaseMonthlyPaymentAmount
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

export default { loansResearchMain };
