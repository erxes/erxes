import {
  attachmentType,
  attachmentInput
} from '@erxes/api-utils/src/commonTypeDefs';

export const types = () => `

  ${attachmentType}
  ${attachmentInput}

  extend type User @key(fields: "_id") {
    _id: String! @external
  }
  type VirtualSchedule {
    index: Float
    loanBalance: Float
    loanPayment: Float
    calcedInterest: Float
    totalPayment: Float
  }

  type Schedule {
    _id: String
    contractId: String
    version: String
    createdAt: Date
    status: String
    payDate: Date
    balance: Float

    undue: Float
    interest: Float
    interestEve: Float
    interestNonce: Float
    payment: Float
    insurance: Float
    debt: Float
    total: Float

    didUndue: Float
    didInterest: Float
    didInterestEve: Float
    didInterestNonce: Float
    didPayment: Float
    didInsurance: Float
    didDebt: Float
    didTotal: Float
    surplus: Float

    isDefault: Boolean
    transactionIds: [String]
  }

  type ScheduleYear {
    year: Float
  }
`;

const virtualScheduleParams = `
  leaseAmount: Float
  tenor: Float
  interestRate: Float
  repayment: String
`;

export const queries = `
  virtualSchedules(${virtualScheduleParams}): [VirtualSchedule]
  cpSchedules(contractId: String!, status: String): [Schedule]
  schedules(contractId: String!, isFirst: Boolean, year: Float): [Schedule]
  scheduleYears(contractId: String!): [ScheduleYear]
`;

export const mutations = `
  regenSchedules(contractId: String!): String
`;
