import { transactionFields, transactionOtherFields } from './queries';

const commonFields = `
  $contractId: String,
  $customerId: String,
  $companyId: String,
  $description: String,
  $total: Float,
  $isManual: Boolean,
  $payDate: Date,
  $payment: Float,
  $transactionType: String,
`;

const commonVariables = `
  contractId: $contractId,
  customerId: $customerId,
  companyId: $companyId,
  description: $description,
  total: $total,
  isManual: $isManual,
  payDate: $payDate,
  payment: $payment,
  transactionType: $transactionType
`;

const changeFields = `
  $payment: Float,
`;

const changeVariables = `
  payment: $payment,
`;

const transactionsAdd = `
  mutation savingsTransactionsAdd(${commonFields}) {
    savingsTransactionsAdd(${commonVariables}) {
      _id
      ${transactionFields}
      ${transactionOtherFields}
    }
  }
`;

const transactionsEdit = `
  mutation savingsTransactionsEdit($_id: String!, ${commonFields}) {
    savingsTransactionsEdit(_id: $_id, ${commonVariables}) {
      _id
      ${transactionFields}
      ${transactionOtherFields}
    }
  }
`;

const transactionsChange = `
  mutation savingsTransactionsChange($_id: String!, ${changeFields}) {
    savingsTransactionsChange(_id: $_id, ${changeVariables}) {
      _id
      ${transactionFields}
      ${transactionOtherFields}
    }
  }
`;

const transactionsRemove = `
  mutation savingsTransactionsRemove($transactionIds: [String]) {
    savingsTransactionsRemove(transactionIds: $transactionIds)
  }
`;

export default {
  transactionsAdd,
  transactionsEdit,
  transactionsChange,
  transactionsRemove
};
