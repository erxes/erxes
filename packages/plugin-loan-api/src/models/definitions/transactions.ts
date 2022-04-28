export interface ICalcDivideParams { contractId?: string, payDate: Date }

export interface ICalcTrParams { contractId: string, payDate: Date, total: number }

export interface IBankTransaction {
  amount: string,
  date: Date,
  description?: string,
  fromAccount?: string,
  fromBank?: string,
  toBank?: string,
  toAccount?: string,
  toOwner?: string,
}

export interface ITransaction {
  contractId?: string,
  createdAt: Date,
  createdBy?: string
  customerId?: string,
  companyId?: string,
  invoiceId?: string,
  description?: string,
  payDate: Date,
  payment?: number,
  interestEve?: number,
  interestNonce?: number,
  undue?: number,
  insurance?: number,
  debt?: number,
  total: number,
  surplus?: number,
  calcedInfo?: {
    payment?: number,
    interestEve?: number,
    interestNonce?: number,
    undue?: number,
    insurance?: number,
    debt?: number,
    total: number,
    surplus?: number,
  },
  futureDebt?: number,
  debtTenor?: number,
}

export interface ITransactionDoc extends ITransaction {
  _id: string;
}

export const transactionSchema = {
  _id: { pkey: true },
  contractId: { type: String, optional: true, label: 'Contract', index: true },
  customerId: { type: String, optional: true, label: 'Customer', index: true },
  companyId: { type: String, optional: true, label: 'Company', index: true },
  invoiceId: { type: String, optional: true, label: 'Invoice', index: true },
  description: { type: String, optional: true, label: 'Description' },
  payDate: {
    type: Date,
    default: new Date(),
    label: 'Created at',
  },
  payment: { type: Number, min: 0, optional: true, label: 'payment' },
  interestEve: { type: Number, min: 0, optional: true, label: 'interest eve month' },
  interestNonce: { type: Number, min: 0, optional: true, label: 'interest nonce month' },
  undue: { type: Number, min: 0, optional: true, label: 'undue' },
  insurance: { type: Number, min: 0, optional: true, label: 'insurance' },
  debt: { type: Number, min: 0, optional: true, label: 'debt' },
  surplus: { type: Number, min: 0, optional: true, label: 'surplus' },
  total: { type: Number, min: 0, label: 'total' },
  createdAt: {
    type: Date,
    default: new Date(),
    label: 'Created at',
  },
  createdBy: { type: String, optional: true, label: 'created member' },
  calcedInfo: {
    type: {
      payment: Number,
      interestEve: Number,
      interestNonce: Number,
      undue: Number,
      insurance: Number,
      debt: Number,
      total: Number,
      surplus: Number,
    }, optional: true, label: 'default calced info'
  },
  pendings: { type: [Object], label: 'Pending Schedules reaction' },
  reactions: { type: [Object], label: 'Pending Schedules reaction' },
  futureDebt: { type: Number, min: 0, optional: true, label: 'future Debt' },
  debtTenor: { type: Number, min: 0, optional: true, label: 'debt Tenor' },
};
