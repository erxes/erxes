export const types = () => `
  type LoanSchedule {
    _id: String
    contractId: String
    version: String
    createdAt: Date
    status: String
    payDate: Date
    balance: Float

    loss: Float
    interest: Float
    interestEve: Float
    interestNonce: Float
    commitmentInterest: Float
    payment: Float
    insurance: Float
    debt: Float
    total: Float
    giveAmount: Float

    didLoss: Float
    didInterest: Float
    didInterestEve: Float
    didInterestNonce: Float
    didCommitmentInterest: Float
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

export const queries = `
  cpSchedules(contractId: String!, status: String): [LoanSchedule]
  schedules(contractId: String!, isFirst: Boolean, year: Float): [LoanSchedule]
  scheduleYears(contractId: String!): [ScheduleYear]
`;

export const mutations = `
  regenSchedules(contractId: String!, leaseAmount: Float, ): String
  fixSchedules(contractId: String!): String
`;
