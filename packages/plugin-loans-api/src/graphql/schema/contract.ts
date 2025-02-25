const commonFields = `
  contractTypeId: String
  number: String
  useManualNumbering: Boolean
  foreignNumber: String
  relContractId: String
  dealId: String
  currency: String

  status: String
  statusChangedDate: Date

  classification: String
  branchId: String
  description: String
  createdBy: String
  createdAt: Date
  modifiedBy: String
  modifiedAt: Date

  marginAmount: Float
  leaseAmount: Float
  feeAmount: Float

  tenor: Float
  repayment: String
  interestRate: Float
  lossPercent: Float
  lossCalcType: String

  contractDate: Date
  startDate: Date
  firstPayDate: Date
  endDate: Date
  scheduleDays: [Int]
  stepRules: [JSON]

  insuranceAmount: Float
  debt: Float
  debtTenor: Float
  debtLimit: Float

  collateralsData: [JSON]
  insurancesData: [JSON]

  customerType: String
  customerId: String
  relCustomers: [JSON]

  relationExpertId: String
  leasingExpertId: String
  riskExpertId: String

  closeDate: Date
  closeType: String
  closeDescription: String

  loanPurpose: String
  loanDestination: String
  leaseType: String

  customFieldsData: JSON
  savingContractId: String
  depositAccountId: String

  holidayType: String
  weekends: [Int]
`;

export const types = () => `
  type LoanCurrentSchedule {
    contractId: String
    version: String
    payDate: Date
    balance: Float
    payment: Float
    interest: Float
    interestEve: Float
    interestNonce: Float
    total: Float
    createdAt: Date
    untilDay: Float
    donePercent: Float
    remainderTenor: Int
  }

  type RecContract {
    _id: String
    number: String
    startDate: Date
    closeDate: Date
    closeType: String
  }

  type LoanContract {
    _id: String

    ${commonFields}

    contractType: ContractType
    relContract: RecContract
    customer: Customer
    company: Company
    givenAmount: Float

    hasTransaction: Boolean
    nextPaymentDate: Date
    nextPayment: Float
    payedAmountSum: Float
    loanBalanceAmount: Float
    expiredDays: Float
    loanTransactionHistory: JSON
    storeInterest: JSON
    storedInterest: Float
    lastStoredDate: Date

    commitmentInterest: Float
    mustPayDate: Date
    unUsedBalance: Float
    invoices: JSON
    currentSchedule: LoanCurrentSchedule
    insurances: JSON
    collaterals: JSON
    relationExpert: JSON
    leasingExpert: JSON
    riskExpert: JSON
  }


  type CollateralsDataResponse {
    collateralsData: [JSON]
  }

  type CloseInfo {
    balance: Float,
    loss: Float,
    interest: Float,
    interestEve: Float,
    interestNonce: Float,
    payment: Float,
    insurance: Float,
    debt: Float,
    total: Float,
    storedInterest: Float,
  }

  type ContractsListResponse {
    list: [LoanContract],
    totalCount: Float,
  }

  type LoanAlert {
    name: String,
    count: Float,
    filter: JSON,
  }
`;

const queryParams = `
  page: Int
  perPage: Int
  sortField: String
  sortDirection: Int

  searchValue: String
  ids: [String]
  excludeIds: Boolean,
  contractTypeId: String
  conformityMainType: String
  conformityMainTypeId: String
  conformityRelType: String
  conformityIsRelated: Boolean
  isExpired: String
  repaymentDate: String
  startStartDate: Date
  endStartDate: Date
  startCloseDate: Date
  endCloseDate: Date
  dealId: String
  customerId: String
  leaseAmount: Float
  interestRate: Float
  tenor: Int
  repayment: String
  conformityIsSaved: Boolean
  closeDate: Date
  closeDateType: String
  branchId: String
  status: String
  leaseType: String
  leaseTypes: [String]
  statuses: [String]

  dealIds: [String]
`;

export const queries = `
  contractsMain(${queryParams}): ContractsListResponse
  contracts(${queryParams}): [LoanContract]
  clientLoansContracts(${queryParams}): [LoanContract]
  contractDetail(_id: String!): LoanContract
  cpContracts(cpUserType: String cpUserEmail: String cpUserPhone: String): [LoanContract]
  cpContractDetail(_id: String!): LoanContract
  closeInfo(contractId: String, date: Date): CloseInfo
  contractsAlert(date: Date): [LoanAlert]
  convertToContract(id: String!, contentType: String): JSON
  dealLoanContract(dealId: String, args: JSON): JSON
`;

const interestCorrectionFields = `
  contractId: String
  stoppedDate: Date
  isStopLoss: Boolean
  interestAmount: Float
  lossAmount: Float
`;

const clientFields = `
  secondaryPassword: String
`;

const clientCreditLoanRequestFields = `
  contractId: String
  amount: Float
  customerId: String
  secondaryPassword: String
  dealtType: String
  accountNumber: String
  accountHolderName: String
  externalBankName: String
`;

export const mutations = `
  contractsAdd(${commonFields}): LoanContract
  clientLoanContractsAdd(${commonFields}${clientFields}): LoanContract
  contractsEdit(_id: String!, ${commonFields}): LoanContract
  contractsDealEdit(_id: String!, dealId: String): LoanContract
  contractsClose(contractId: String, closeDate: Date, closeType: String, description: String): LoanContract
  contractsRemove(contractIds: [String]): [String]
  getProductsData(contractId: String): CollateralsDataResponse
  stopInterest(${interestCorrectionFields}): LoanContract
  interestChange(${interestCorrectionFields}): LoanContract
  interestReturn(${interestCorrectionFields}): LoanContract
  clientCreditLoanRequest(${clientCreditLoanRequestFields}): LoanContract
  clientCreditLoanCalculate(customerId: String): JSON
`;
