const commonFields = `
  $dealId: String
  $customerType: String
  $customerId: String
  $debtIncomeRatio: Float
  $increaseMonthlyPaymentAmount: Float

  $averageSalaryIncome: Int
  $averageBusinessIncome: Int
  $totalIncome: Int
  $incomes: [IncomeInput]

  $monthlyCostAmount: Int
  $monthlyLoanAmount: Int
  $totalPaymentAmount: Int
  $loans: [LoanInput]
`;

const commonVariables = `
  dealId: $dealId
  customerType: $customerType
  customerId: $customerId
  debtIncomeRatio: $debtIncomeRatio
  increaseMonthlyPaymentAmount: $increaseMonthlyPaymentAmount

  averageSalaryIncome: $averageSalaryIncome
  averageBusinessIncome: $averageBusinessIncome
  totalIncome: $totalIncome
  incomes: $incomes

  monthlyCostAmount: $monthlyCostAmount
  monthlyLoanAmount: $monthlyLoanAmount
  totalPaymentAmount: $totalPaymentAmount
  loans: $loans
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
