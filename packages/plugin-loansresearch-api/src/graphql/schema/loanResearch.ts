import {
  attachmentType,
  attachmentInput,
} from '@erxes/api-utils/src/commonTypeDefs';

const commonIncomeTypes = `
  _id: String
  incomeType: String
  totalSalaryIncome: Int
  totalMonth: Int

  businessLine: String
  businessDetails: String
  businessProfile: String
  businessIncome: Int
`;

const commonLoanTypes = `
  _id: String
  loanType: String

  loanName: String
  loanLocation: String
  startDate: Date
  closeDate: Date
  loanAmount: Int
  
  costName: String
  costAmount: Int
`;

export const types = () => `

  ${attachmentType}
  ${attachmentInput}
  
  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  type Income {
    ${commonIncomeTypes}
    financialInformation: Attachment
    files: [Attachment]
  }

  type Loan {
    ${commonLoanTypes}
    files: [Attachment]
  }

  type LoansResearch {
    _id: String!
    dealId: String
    customerType: String
    customerId: String
    debtIncomeRatio: Float
    increaseMonthlyPaymentAmount: Float

    averageSalaryIncome: Int
    averageBusinessIncome: Int
    totalIncome: Int
    incomes: [Income]

    monthlyCostAmount: Int
    monthlyLoanAmount: Int
    totalPaymentAmount: Int
    loans: [Loan]
    
    createdAt: Date
    modifiedAt: Date
  }

  type LoansResearchListResponse {
    list: [LoansResearch],
    totalCount: Int,
  }

  input IncomeInput {
    ${commonIncomeTypes}
    financialInformation: AttachmentInput
    files: [AttachmentInput]
  }

  input LoanInput {
    ${commonLoanTypes}
    files: [AttachmentInput]
  }

`;

const queryParams = `
  page: Int
  perPage: Int
  sortField: String
  sortDirection: Int
`;

export const queries = `
  loansResearchMain(${queryParams}): LoansResearchListResponse
`;

const commonFields = `
  dealId: String
  customerType: String
  customerId: String
  debtIncomeRatio: Float
  increaseMonthlyPaymentAmount: Float

  averageSalaryIncome: Int
  averageBusinessIncome: Int
  totalIncome: Int
  incomes: [IncomeInput]

  monthlyCostAmount: Int
  monthlyLoanAmount: Int
  totalPaymentAmount: Int
  loans: [LoanInput]  
`;

export const mutations = `
  loansResearchAdd(${commonFields}): LoansResearch
  loansResearchEdit(_id: String!, ${commonFields}): LoansResearch
  loansResearchRemove(loanResearchIds: [String]): [String]
`;
