import { gql } from '@apollo/client';

import {
  commonPaymentParamDefs,
  commonPaymentParams,
  createInvoiceParamDefs,
  createInvoiceParams,
  paymentConfigFields
} from './common';

const paymentAdd = gql`
mutation paymentAdd(${commonPaymentParamDefs}) {
  paymentAdd(${commonPaymentParams}) {
    _id
  }
}
`;

const paymentEdit = gql`
mutation PaymentEdit($_id: String!, ${commonPaymentParamDefs}) {
  paymentEdit(_id: $_id, ${commonPaymentParams}) {
    _id
  }
}
`;

const paymentRemove = gql`
  mutation paymentRemove($_id: String!) {
    paymentRemove(_id: $_id)
  }
`;

const createInvoice = gql`
mutation createInvoice(${createInvoiceParamDefs}) {
  createInvoice(${createInvoiceParams})
}
`;

const setPaymentConfig = gql`
  mutation SetPaymentConfig($contentType: String!, $contentTypeId: String!) {
    setPaymentConfig(contentType: $contentType, contentTypeId: $contentTypeId) {
      _id
      paymentIds
    }
  }
`;

const paymentConfigsAdd = gql`
mutation PaymentConfigsAdd($contentType: String!, $contentTypeId: String!, $paymentIds: [String]) {
  paymentConfigsAdd(contentType: $contentType, contentTypeId: $contentTypeId, paymentIds: $paymentIds) {
    ${paymentConfigFields}
  }
}
`;

const paymentConfigsEdit = gql`
  mutation PaymentConfigsEdit($_id: String!, $paymentIds: [String]) {
    paymentConfigsEdit(_id: $_id, paymentIds: $paymentIds) {
      ${paymentConfigFields}
    }
  }
`;

const paymentConfigsRemove = gql`
  mutation PaymentConfigsRemove($_id: String!) {
    paymentConfigsRemove(_id: $_id)
  }
`;

const checkInvoice = gql`
  mutation invoicesCheck($_id: String!) {
    invoicesCheck(_id: $_id)
  }
`;

const removeInvoices = gql`
  mutation InvoicesRemove($_ids: [String]!) {
    invoicesRemove(_ids: $_ids)
  }
`;

export default {
  paymentAdd,
  paymentEdit,
  paymentRemove,
  createInvoice,
  checkInvoice,
  removeInvoices,
  setPaymentConfig,

  paymentConfigsAdd,
  paymentConfigsEdit,
  paymentConfigsRemove
};
