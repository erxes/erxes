import { transactionFields, transactionOtherFields } from './queries';

const commonFields = `
  $contractId: String,
  $customerId: String,
  $companyId: String,
  $invoiceId: String,
  $description: String,
  $total: Float,

  $payDate: Date,
  $payment: Float,
  $interestEve: Float,
  $interestNonce: Float,
  $undue: Float,
  $insurance: Float,
  $debt: Float,
`;

const commonVariables = `
  contractId: $contractId,
  customerId: $customerId,
  companyId: $companyId,
  invoiceId: $invoiceId,
  description: $description,
  total: $total,

  payDate: $payDate,
  payment: $payment,
  interestEve: $interestEve,
  interestNonce: $interestNonce,
  undue: $undue,
  insurance: $insurance,
  debt: $debt,
`;

const changeFields = `
  $payment: Float,
  $interestEve: Float,
  $interestNonce: Float,
  $undue: Float,
  $insurance: Float,
  $debt: Float,
  $futureDebt: Float,
  $debtTenor: Float,
`;

const changeVariables = `
  payment: $payment,
  interestEve: $interestEve,
  interestNonce: $interestNonce,
  undue: $undue,
  insurance: $insurance,
  debt: $debt,
  futureDebt: $futureDebt,
  debtTenor: $debtTenor,
`;

const transactionsAdd = `
  mutation transactionsAdd(${commonFields}) {
    transactionsAdd(${commonVariables}) {
      _id
      ${transactionFields}
      ${transactionOtherFields}
    }
  }
`;

const transactionsEdit = `
  mutation transactionsEdit($_id: String!, ${commonFields}) {
    transactionsEdit(_id: $_id, ${commonVariables}) {
      _id
      ${transactionFields}
      ${transactionOtherFields}
    }
  }
`;

const transactionsChange = `
  mutation transactionsChange($_id: String!, ${changeFields}) {
    transactionsChange(_id: $_id, ${changeVariables}) {
      _id
      ${transactionFields}
      ${transactionOtherFields}
    }
  }
`;

const transactionsRemove = `
  mutation transactionsRemove($transactionIds: [String]) {
    transactionsRemove(transactionIds: $transactionIds)
  }
`;

export default {
  transactionsAdd,
  transactionsEdit,
  transactionsChange,
  transactionsRemove
};
