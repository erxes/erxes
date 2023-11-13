export const types = () => `
  type VirtualSchedule {
    index: Float
    loanBalance: Float
    loanPayment: Float
    calcedInterest: Float
    totalPayment: Float
  }

  type LoanSchedule {
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
  cpSchedules(contractId: String!, status: String): [LoanSchedule]
  schedules(contractId: String!, isFirst: Boolean, year: Float): [LoanSchedule]
  scheduleYears(contractId: String!): [ScheduleYear]
  getGraphicValue(contract:JSON):[LoanSchedule]
`;

export const mutations = `
  regenSchedules(contractId: String!): String
  fixSchedules(contractId: String!): String
`;
