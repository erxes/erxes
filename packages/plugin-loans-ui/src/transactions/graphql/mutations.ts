import { transactionFields, transactionOtherFields } from './queries';

const commonFields = `
  $contractId: String,
  $customerId: String,
  $companyId: String,
  $invoiceId: String,
  $description: String,
  $total: Float,
  $isManual: Boolean,
  $payDate: Date,
  $payment: Float,
  $interestEve: Float,
  $interestNonce: Float,
  $undue: Float,
  $insurance: Float,
  $debt: Float,
  $isGetEBarimt: Boolean,
  $isOrganization: Boolean,
  $organizationRegister: String,
`;

const commonVariables = `
  contractId: $contractId,
  customerId: $customerId,
  companyId: $companyId,
  invoiceId: $invoiceId,
  description: $description,
  total: $total,
  isManual: $isManual,
  payDate: $payDate,
  payment: $payment,
  interestEve: $interestEve,
  interestNonce: $interestNonce,
  undue: $undue,
  insurance: $insurance,
  debt: $debt,
  isGetEBarimt: $isGetEBarimt,
  isOrganization: $isOrganization,
  organizationRegister: $organizationRegister,
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

const createEBarimtOnTransaction = `
mutation createEBarimtOnTransaction($id: String!, $isGetEBarimt:Boolean, $isOrganization:Boolean, $organizationRegister:String) {
  createEBarimtOnTransaction(id: $id, isGetEBarimt: $isGetEBarimt,isOrganization: $isOrganization,organizationRegister: $organizationRegister) {
    _id
    ${transactionOtherFields}
  }
}
`;

export default {
  transactionsAdd,
  transactionsEdit,
  transactionsChange,
  transactionsRemove,
  createEBarimtOnTransaction
};
