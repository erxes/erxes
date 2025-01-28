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
  debtIncomeRatio
  increaseMonthlyPaymentAmount

  averageSalaryIncome
  averageBusinessIncome
  totalIncome
  incomes {
    _id
    incomeType
    totalSalaryIncome
    totalMonth

    businessLine
    businessDetails
    businessProfile
    businessIncome

    files {
      url
      name
      size
      type
    }
  }

  monthlyCostAmount
  monthlyLoanAmount
  totalPaymentAmount
  loans {
    _id
    loanType
    loanName
    loanLocation
    startDate
    closeDate
    loanAmount

    costName
    costAmount
    files {
      url
      name
      size
      type
    }
  }

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
query loanResearchDetail($dealId: String!) {
  loanResearchDetail(dealId: $dealId) {
    ${loansResearchFields}
  }
}
`;

export default { loansResearchMain, loanResearchDetail };
