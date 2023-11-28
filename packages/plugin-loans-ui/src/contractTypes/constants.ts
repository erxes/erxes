export const JOURNALS_KEY_LABELS = {
  otherReceivable: 'Other Receivable',

  isAmountUseEBarimt: 'is Calc EBarimt from Amount',
  isInterestUseEBarimt: 'is Calc EBarimt from Interest',
  isUndueUseEBarimt: 'is Calc EBarimt from Loss',
  transAccount: 'Transaction Account',
  normalAccount: 'Normal Loan Account',
  expiredAccount: 'Expired Loan Account',
  doubtfulAccount: 'Doubtful Loan Account',
  negativeAccount: 'Negative Loan Account',
  badAccount: 'Bad Loan Account',
  amountHasEBarimt: 'EBarimt calculate from Amount for Journal',
  interestAccount: 'Interest Account',
  interestHasEBarimt: 'EBarimt calculate from Interest for Journal',
  insuranceAccount: 'Insurance Account',
  debtAccount: 'Debt Account',
  feeIncomeAccount: 'Fee Account',
  undueAccount: 'Loss Account',
  undueHasEBarimt: 'EBarimt calculate from Loss for Journal',
  eBarimtAccount: 'EBarimt Account',
  organizationRegister: 'Organization register',
  normalExpirationDay: 'Normal classification day',
  expiredExpirationDay: 'Expired classification begin day',
  doubtExpirationDay: 'Doubtful classification begin day',
  negativeExpirationDay: 'Negative classification begin day',
  badExpirationDay: 'Bad classification begin day',
  minInterest: 'Min interest of month',
  maxInterest: 'Max interest of month',
  defaultInterest: 'Default interest of month',
  minTenor: 'Min tenor',
  maxTenor: 'Max tenor',
  minAmount: 'Min amount',
  maxAmount: 'Max amount',
  isAutoSendEBarimt: 'Is send e-barimt auto',
  defaultGSCode: 'DEFAULTGSCODE',
  isHasVat: 'isHasVat'
};

export const LEASE_TYPES = {
  FINANCE: 'finance',
  SALVAGE: 'salvage',
  LINEAR: 'linear',
  CREDIT: 'credit',

  ALL: ['finance', 'salvage', 'linear', 'credit']
};

export const COLLATERAL_TYPE = {
  ALL: ['car', 'saving', 'realEstate', 'other'],
  CAR: 'car',
  SAVING: 'saving',
  REAL_ESTATE: 'realEstate',
  OTHER: 'other'
};

// erkhet.role.cashAccount ==== journalConfig.repaymentTemp
// erkhet.role.debAccount ==== journalConfig.tempDebt
// erkhet.mainInventory.saleAccount ==== denchinDans |
