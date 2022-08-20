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
  mutation invoicesAdd(${commonFields}) {
    invoicesAdd(${commonVariables}) {
      _id
      ${invoiceFields}
      ${invoiceOtherFields}
    }
  }
`;

const invoicesEdit = `
  mutation invoicesEdit($_id: String!, ${commonFields}) {
    invoicesEdit(_id: $_id, ${commonVariables}) {
      _id
      ${invoiceFields}
      ${invoiceOtherFields}
    }
  }
`;

const invoicesRemove = `
  mutation invoicesRemove($invoiceIds: [String]) {
    invoicesRemove(invoiceIds: $invoiceIds)
  }
`;

export default {
  invoicesAdd,
  invoicesEdit,
  invoicesRemove
};
