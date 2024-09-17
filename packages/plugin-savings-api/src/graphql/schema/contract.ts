export const types = () => `
  type SavingLoans {
    _id: String
    number: String
  }

  type SavingContract {
    _id: String
    contractTypeId: String
    number: String
    branchId:String
    status: String
    description: String
    createdBy: String
    createdAt: Date
    savingAmount: Float
    duration: Float
    interestRate: Float
    closeInterestRate: Float
    startDate: Date
    endDate: Date
    customerId: String
    customerType: String

    contractType: SavingContractType
    companies: Company
    customers: Customer

    closeDate: Date
    closeType: String
    closeDescription: String

    dealId: String
    hasTransaction:Boolean
    savingTransactionHistory:JSON
    currency:String
    interestGiveType: String
    closeOrExtendConfig: String
    depositAccount: String
    storedInterest: Float
    storeInterestInterval: String
    interestCalcType: String
    isAllowIncome: Boolean
    isAllowOutcome: Boolean
    isDeposit: Boolean
    loansOfForeclosed: [SavingLoans]
    customFieldsData: JSON
    blockAmount: Float
  }

  type SavingCloseInfo {
    balance: Float,
    storedInterest: Float,
    calcedInterest: Float,
    preCloseInterest: Float,
    total: Float
  }

  type SavingAlert {
    name: String,
    count: Float,
    filter: JSON,
  }

  type SavingContractsListResponse {
    list: [SavingContract],
    totalCount: Float,
  }
`;

const queryParams = `
  page: Int
  perPage: Int
  ids: [String]
  searchValue: String
  sortField: String
  sortDirection: Int
  contractTypeId: String
  conformityMainType: String
  conformityMainTypeId: String
  conformityRelType: String
  conformityIsRelated: Boolean
  isExpired: String
  repaymentDate: String
  startStartDate:Date
  endStartDate:Date
  startCloseDate:Date
  endCloseDate:Date
  dealId:String
  customerId:String
  savingAmount: Float
  interestRate: Float
  repayment: String
  conformityIsSaved: Boolean
  closeDate: Date
  closeDateType: String
  branchId: String
  status: String
  isDeposit: Boolean
`;

const checkBalanceParams = `
  contractId: String
  requiredAmount: Float
`;

export const queries = `
  savingsContractsMain(${queryParams}): SavingContractsListResponse
  savingsContracts(${queryParams}): [SavingContract]
  clientSavingsContracts(${queryParams}): [SavingContract]
  savingsContractDetail(_id: String!): SavingContract
  savingsCloseInfo(contractId: String, date: Date): SavingCloseInfo
  savingsContractsAlert(date: Date): [SavingAlert]
  checkAccountBalance(${checkBalanceParams}): String
  getAccountOwner(accountNumber: String!):String
`;

const commonFields = `
  contractTypeId: String
  number: String
  branchId:String
  status: String
  description: String
  createdBy: String
  createdAt: Date
  savingAmount: Float
  duration: Float
  interestRate: Float
  closeInterestRate: Float
  startDate: Date
  customerId: String
  customerType: String
  dealId: String
  currency: String
  interestGiveType: String
  closeOrExtendConfig: String
  depositAccount: String
  storeInterestInterval: String
  interestCalcType: String
  isAllowIncome: Boolean
  isAllowOutcome: Boolean
  isDeposit: Boolean
  customFieldsData: JSON
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

export const mutations = `
  savingsContractsAdd(${commonFields}): SavingContract
  clientSavingsContractsAdd(${commonFields}${clientFields}): SavingContract
  savingsContractsEdit(_id: String!, ${commonFields}): SavingContract
  savingsContractsDealEdit(_id: String!, ${commonFields}): SavingContract
  savingsContractsClose(contractId: String, closeDate: Date, closeType: String, description: String): SavingContract
  savingsContractsRemove(contractIds: [String]): [String]
  savingsInterestChange(${interestCorrectionFields}): SavingContract
  savingsInterestReturn(${interestCorrectionFields}): SavingContract
  savingsExpandDuration(_id: String!,contractTypeId:String):SavingContract
  clientSavingSubmit(customerId: String!):SavingContract
`;
