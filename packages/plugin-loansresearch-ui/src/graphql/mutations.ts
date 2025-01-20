const commonFields = `
  $dealId: String
  $customerType: String
  $customerId: String
  $incomes: [IncomeInput]
  $loans: [LoanInput]
  $totalMonth: Int
  $totalIncome: Int
  $monthlyIncome: Int
  $totalLoanAmount: Int
  $monthlyPaymentAmount: Int
  $debtIncomeRatio: Float
  $increaseMonthlyPaymentAmount: Float
`;

const commonVariables = `
  dealId: $dealId
  customerType: $customerType
  customerId: $customerId
  incomes: $incomes
  loans: $loans
  totalMonth: $totalMonth
  totalIncome: $totalIncome
  monthlyIncome: $monthlyIncome
  totalLoanAmount: $totalLoanAmount
  monthlyPaymentAmount: $monthlyPaymentAmount
  debtIncomeRatio: $debtIncomeRatio
  increaseMonthlyPaymentAmount: $increaseMonthlyPaymentAmount
`;

const loansResearchAdd = `
  mutation loansResearchAdd(${commonFields}) {
    loansResearchAdd(${commonVariables}) {
      _id
    }
  }
`;

const loansResearchEdit = `
  mutation loansResearchEdit($_id: String!, ${commonFields}) {
    loansResearchEdit(_id: $_id, ${commonVariables}) {
      _id
    }
  }
`;

const loansResearchRemove = `
  mutation loansResearchRemove($loanResearchIds: [String]) {
    loansResearchRemove(loanResearchIds: $loanResearchIds)
  }
`;

export default {
  loansResearchAdd,
  loansResearchEdit,
  loansResearchRemove,
};
