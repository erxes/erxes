import { gql } from '@apollo/client';

export const ADD_PAYMENT = gql`
  mutation paymentAdd($input: PaymentInput!) {
    paymentAdd(input: $input) {
      _id
      name
      createdAt
    }
  }
`;

export const EDIT_PAYMENT = gql`
  mutation paymentEdit($_id: String!, $input: PaymentInput!) {
    paymentEdit(_id: $_id, input: $input) {
      _id
      name
      createdAt
    }
  }
`;

export const REMOVE_PAYMENT = gql`
  mutation paymentRemove($_ids: [String!]!) {
    paymentRemove(_ids: $_ids)
  }
`;

export const INVOICE_SCAN_BARCODE = gql`
  mutation InvoiceScanBarcode($code: String!) {
    invoiceScanBarcode(code: $code) {
      _id
      invoiceNumber
      amount
      currency
      description
      status
      scannedAt
      createdAt
    }
  }
`;
