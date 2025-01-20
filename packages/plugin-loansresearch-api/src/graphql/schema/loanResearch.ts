import {
  attachmentType,
  attachmentInput,
} from '@erxes/api-utils/src/commonTypeDefs';

const commonIncomeTypes = `
  _id: String
  incomeType: String 
`;

const commonLoanTypes = `
  _id: String
  startDate: Date
  closeDate: Date
`;

export const types = () => `

  ${attachmentType}
  ${attachmentInput}
  
  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  type Income {
    ${commonIncomeTypes}
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
    incomes: [Income]
    loans: [Loan]
    totalMonth: Int
    totalIncome: Int
    monthlyIncome: Int
    totalLoanAmount: Int
    monthlyPaymentAmount: Int
    debtIncomeRatio: Float
    increaseMonthlyPaymentAmount: Float
    createdAt: Date
    modifiedAt: Date
  }

  type LoansResearchListResponse {
    list: [LoansResearch],
    totalCount: Int,
  }

  input IncomeInput {
    ${commonIncomeTypes}
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
  incomes: [IncomeInput]
  loans: [LoanInput]
  totalMonth: Int
  totalIncome: Int
  monthlyIncome: Int
  totalLoanAmount: Int
  monthlyPaymentAmount: Int
  debtIncomeRatio: Float
  increaseMonthlyPaymentAmount: Float
`;

export const mutations = `
  loansResearchAdd(${commonFields}): LoansResearch
  loansResearchEdit(_id: String!, ${commonFields}): LoansResearch
  loansResearchRemove(loanResearchIds: [String]): [String]
`;
