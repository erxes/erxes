import { invoiceFields, invoiceOtherFields } from './queries';

const commonFields = `
  $contractId: String,
  $customerId: String,
  $companyId: String,
  $number: String,
  $payDate: Date,
  $payment: Float,
  $interestEve: Float,
  $interestNonce: Float,
  $undue: Float,
  $insurance: Float,
  $debt: Float,
  $total: Float,
`;

const commonVariables = `
  contractId: $contractId,
  customerId: $customerId,
  companyId: $companyId,
  number: $number,
  payDate: $payDate,
  payment: $payment,
  interestEve: $interestEve,
  interestNonce: $interestNonce,
  undue: $undue,
  insurance: $insurance,
  debt: $debt,
  total: $total,
`;

const invoicesAdd = `
  mutation loanInvoicesAdd(${commonFields}) {
    loanInvoicesAdd(${commonVariables}) {
      _id
      ${invoiceFields}
      ${invoiceOtherFields}
    }
  }
`;

const invoicesEdit = `
  mutation loanInvoicesEdit($_id: String!, ${commonFields}) {
    loanInvoicesEdit(_id: $_id, ${commonVariables}) {
      _id
      ${invoiceFields}
      ${invoiceOtherFields}
    }
  }
`;

const invoicesRemove = `
  mutation loanInvoicesRemove($invoiceIds: [String]) {
    loanInvoicesRemove(invoiceIds: $invoiceIds)
  }
`;

export default {
  invoicesAdd,
  invoicesEdit,
  invoicesRemove
};
