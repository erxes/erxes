import { gql } from '@apollo/client';

export const INVOICE_SUBSCRIPTION = gql`
  subscription invoiceUpdated($invoiceId: String!) {
    invoiceUpdated(_id: $invoiceId)
  }
`;

export const TRANSACTION_SUBSCRIPTION = gql`
  subscription transactionUpdated($invoiceId: String!) {
    transactionUpdated(invoiceId: $invoiceId)
  }
`;

export const PAYMENTS_QRY = gql`
query PaymentsPublic($kind: String, $ids: [String], $currency: String) {
  paymentsPublic(kind: $kind, _ids: $ids, currency: $currency) {
    _id
    kind
    name
  }
}
`;

export const INVOICE = gql`
  query InvoiceDetail($id: String!) {
    invoiceDetail(_id: $id) {
      _id
      invoiceNumber
      amount
      currency
      remainingAmount
      description
      phone
      paymentIds
      email
      redirectUri
      status
      transactions {
        _id
        amount
        createdAt
        paymentId
        paymentKind
        response
        status
        payment {
          name
        }
      }
    }
  }
`;

export const ADD_TRANSACTION = gql`
  mutation TransactionsAdd(
    $invoiceId: String!
    $paymentId: String!
    $amount: Float!
    $details: JSON
  ) {
    paymentTransactionsAdd(
      invoiceId: $invoiceId
      paymentId: $paymentId
      amount: $amount
      details: $details
    ) {
      _id
      amount
      invoiceId
      paymentId
      paymentKind
      status
      response
      details
    }
  }
`;

export const CHECK_INVOICE = gql`
  mutation InvoicesCheck($id: String!) {
    invoicesCheck(_id: $id)
  }
`;
