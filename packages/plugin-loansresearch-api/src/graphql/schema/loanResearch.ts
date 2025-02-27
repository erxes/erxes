import {
  attachmentType,
  attachmentInput,
} from '@erxes/api-utils/src/commonTypeDefs';

const commonIncomeTypes = `
  _id: String
  incomeType: String
  totalSalaryIncome: Float
  totalMonth: Int

  businessLine: String
  businessDetails: String
  businessProfile: String
  businessIncome: Float
`;

const commonLoanTypes = `
  _id: String
  loanType: String

  loanName: String
  loanLocation: String
  startDate: Date
  closeDate: Date
  loanAmount: Float
  
  costName: String
  costAmount: Float
`;

export const types = () => `

  ${attachmentType}
  ${attachmentInput}
  
  extend type User @key(fields: "_id") {
    _id: String! @external
  }
  extend type Customer @key(fields: "_id") {
    _id: String! @external
  }
  extend type Deal @key(fields: "_id") {
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

    averageSalaryIncome: Float
    averageBusinessIncome: Float
    totalIncome: Float
    incomes: [Income]

    monthlyCostAmount: Float
    monthlyLoanAmount: Float
    totalPaymentAmount: Float
    loans: [Loan]

    customer: Customer
    deal: Deal
    
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
  dealId: String
`;

export const queries = `
  loansResearchMain(${queryParams}): LoansResearchListResponse
  loanResearchDetail(dealId: String, customerId: String): LoansResearch
`;

const commonFields = `
  dealId: String
  customerType: String
  customerId: String
  debtIncomeRatio: Float
  increaseMonthlyPaymentAmount: Float

  averageSalaryIncome: Float
  averageBusinessIncome: Float
  totalIncome: Float
  incomes: [IncomeInput]

  monthlyCostAmount: Float
  monthlyLoanAmount: Float
  totalPaymentAmount: Float
  loans: [LoanInput]  
`;

export const mutations = `
  loansResearchAdd(${commonFields}): LoansResearch
  loansResearchEdit(_id: String!, ${commonFields}): LoansResearch
  loansResearchRemove(loanResearchIds: [String]): [String]
`;
